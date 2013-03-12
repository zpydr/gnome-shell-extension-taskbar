//Code taken from
//https://extensions.gnome.org/extension/368/taskbar-with-desktop-button-to-minimizeunminimize-/
//by Xes http://svn.xesnet.fr/gnomeextensions

const St = imports.gi.St;
const Main = imports.ui.main;
const Lang = imports.lang;
const Gio = imports.gi.Gio;
const Shell = imports.gi.Shell;
const AppDisplay = imports.ui.appDisplay;
const Clutter = imports.gi.Clutter;
const Mainloop = imports.mainloop;
const PopupMenu = imports.ui.popupMenu;
const Panel = imports.ui.panel;
const PanelMenu = imports.ui.panelMenu;
const Gettext = imports.gettext;
const _ = Gettext.gettext;
const Extension = imports.misc.extensionUtils.getCurrentExtension();
const Lib = Extension.imports.lib;
const Prefs = Extension.imports.prefs;
const Windows = Extension.imports.windows;

const schema = "org.gnome.shell.extensions.TaskBar";

function init(extensionMeta)
{
	return new TaskBar(extensionMeta, schema);
}

function TaskBar(extensionMeta, schema)
{
	this.init(extensionMeta, schema);
}

TaskBar.prototype =
{
	extensionMeta: null,
	settings: null,
	boxMain: null,
	windows: null,
	settingSignals: null,
	tasksList: new Array(),
	desktopView: null,
	previewTimer: null,
	preview: null,
	hidingId: null,
	workspacesId: null,

	init: function(extensionMeta, schema)
	{
		this.extensionMeta = extensionMeta;
		this.schema = schema;
		this.prefs = Prefs;
	},

	onParamChanged: function()
	{
		this.disable();
		this.enable();
	},

	enable: function()
	{
		let settings = new Lib.Settings(this.schema);
		this.settings = settings.getSettings();

		//Add TaskBar
		this.iconSize = this.settings.get_int('icon-size');
		this.boxMain = new St.BoxLayout();
		this.onPositionChanged();

		//Add Overview Button
		if (this.settings.get_boolean("display-overview-button"))
		{
			this.iconOverview = new St.Icon(
			{
				icon_name: "view-list-symbolic",
				icon_size: (this.iconSize),
				style_class: "tkb-desktop-icon"
			});
			this.buttonOverview = new St.Button({ style_class: "panel-button" });
			this.signalOverview = this.buttonOverview.connect("clicked", Lang.bind(this, this.onClickOverviewButton));
			this.buttonOverview.set_child(this.iconOverview);
			this.boxOverview = new St.BoxLayout({ style_class: "tkb-desktop-box" });
			this.boxOverview.add_actor(this.buttonOverview);
			this.boxMain.add_actor(this.boxOverview);
		}

		//Add Show Applications Button
		if (this.settings.get_boolean("display-showapps-button"))
		{
			this.iconShowApps = new St.Icon(
			{
				icon_name: "view-grid-symbolic",
				icon_size: (this.iconSize),
				style_class: "tkb-desktop-icon"
			});
			this.buttonShowApps = new St.Button({ style_class: "panel-button" });
			this.signalShowApps = this.buttonShowApps.connect("clicked", Lang.bind(this, this.onClickShowAppsButton));
			this.buttonShowApps.set_child(this.iconShowApps);
			this.boxShowApps = new St.BoxLayout({ style_class: "tkb-desktop-box" });
			this.boxShowApps.add_actor(this.buttonShowApps);
			this.boxMain.add_actor(this.boxShowApps);
		}

		//Add Desktop Button
		if (this.settings.get_enum("display-desktop-button") == 1)
			this.defaultDesktopButton();
		if (this.settings.get_enum("display-desktop-button") == 2)
			this.gtkDesktopButton();
		if (this.settings.get_enum("display-desktop-button") == 3)
			this.darkDesktopButton();
		if (this.settings.get_enum("display-desktop-button") != 0)
		{
			this.buttonDesktop = new St.Button({ style_class: "panel-button", track_hover: true });
			this.signalDesktop = this.buttonDesktop.connect("clicked", Lang.bind(this, this.onClickDesktopButton));
			this.buttonDesktop.set_child(this.iconDesktop);
			this.boxDesktop = new St.BoxLayout({ style_class: "tkb-desktop-box" });
			this.boxDesktop.add_actor(this.buttonDesktop);
			this.boxMain.add_actor(this.boxDesktop);
		}

		//Remove Default Application Menu
		if (this.settings.get_boolean("remove-default-application-menu"))
			this.removeDefaultAppMenu();

		//Remove Activities
		if (this.settings.get_enum("remove-activities") != 0)
			this.removeActivities();

		//Active Task Style
		if (this.settings.get_enum("active-task-style") == 1)
			this.style = "frame";
		if (this.settings.get_enum("active-task-style") == 3)
			this.style = "bgcolor";

		//Init Windows Manage Callbacks
		this.windows = new Windows.Windows(this, this.onWindowsListChanged, this.onWindowChanged);
		this.workspacesId = global.screen.connect('notify::n-workspaces', Lang.bind(this, this.onParamChanged));

		//Reinit extension on param change
		this.settingSignals = [
			this.settings.connect("changed::display-all-workspaces", Lang.bind(this, this.onParamChanged)),
			this.settings.connect("changed::display-desktop-button", Lang.bind(this, this.onParamChanged)),
			this.settings.connect("changed::display-showapps-button", Lang.bind(this, this.onParamChanged)),
			this.settings.connect("changed::display-overview-button", Lang.bind(this, this.onParamChanged)),
			this.settings.connect("changed::remove-activities", Lang.bind(this, this.removeActivities)),
			this.settings.connect("changed::remove-default-application-menu", Lang.bind(this, this.removeDefaultAppMenu)),
			this.settings.connect("changed::active-task-style", Lang.bind(this, this.onParamChanged)),
			this.settings.connect("changed::icon-size", Lang.bind(this, this.onParamChanged)),
			this.settings.connect("changed::panel-position", Lang.bind(this, this.onParamChanged)),
			this.settings.connect("changed::panel-box", Lang.bind(this, this.onBoxChanged))
		];
	},

	//Desktop Button
	defaultDesktopButton: function()
	{
		this._newIconDesktop = Gio.icon_new_for_string(this.extensionMeta.path + '/images/desktop.png');
		this.iconDesktop = new St.Icon(
		{
			gicon: this._newIconDesktop,
			icon_size: (this.iconSize),
			style_class: "tkb-desktop-icon"
		});
	},

	gtkDesktopButton: function()
	{
		this.iconDesktop = new St.Icon(
		{
			icon_name: "desktop",
			icon_size: (this.iconSize),
			style_class: "tkb-desktop-icon"
		});
	},

	darkDesktopButton: function()
	{
		this._newIconDesktop = Gio.icon_new_for_string(this.extensionMeta.path + '/images/darkdesktop.png');
		this.iconDesktop = new St.Icon(
		{
			gicon: this._newIconDesktop,
			icon_size: (this.iconSize),
			style_class: "tkb-desktop-icon"
		});
	},

	//Remove Default Application Menu
	removeDefaultAppMenu: function()
	{
		this.appMenuActor = Main.panel.statusArea.appMenu.actor;
		if (this.settings.get_boolean("remove-default-application-menu"))
		{
			this.appMenuActor.hide();
			this.hidingId = Main.overview.connect('hiding', function ()
			{
				Main.panel.statusArea.appMenu.actor.hide();
			});
		}
		else
		{
			this.appMenuActor.show();
			Main.overview.disconnect(this.hidingId);
		}
	},

	//Remove Activities
	removeActivities: function()
	{
		if (this.settings.get_enum("remove-activities") == 0)
		{
			Main.panel.statusArea.activities.actor.show();
			Main.panel.statusArea.activities.hotCorner._corner.show();
		}
		if (this.settings.get_enum("remove-activities") == 1)
		{
			Main.panel.statusArea.activities.actor.show();
			Main.panel.statusArea.activities.hotCorner._corner.hide();
		}
		if (this.settings.get_enum("remove-activities") == 2)
			Main.panel.statusArea.activities.actor.hide();
	},

	disable: function()
	{
		if (this.settings.get_boolean("remove-default-application-menu"))
		{
			this.appMenuActor.show();
			Main.overview.disconnect(this.hidingId);
		}

		if (this.settings.get_enum("remove-activities") != 0)
		{
			Main.panel.statusArea.activities.actor.show();
			Main.panel.statusArea.activities.hotCorner._corner.show();
		}

		global.screen.disconnect(this.workspacesId);

		//Remove Setting Signals
		this.settingSignals.forEach(
			function(signal)
			{
				this.settings.disconnect(signal);
			},
			this
		);
		this.settingSignals = null;

		//Remove current preview if necessary
		this.hidePreview();

		//Remove TaskBar
		this.windows.destruct();
		this.windows = null;
		this.newBox.remove_child(this.boxMain);
		this.boxMain = null;
		this.cleanTasksList();
	},

	onClickOverviewButton: function()
	{
		if (Main.overview._viewSelector._showAppsButton.checked)
			Main.overview._viewSelector._showAppsButton.checked = false;
		else
			Main.overview.toggle();
	},

	onClickShowAppsButton: function()
	{
		if (!Main.overview._viewSelector._showAppsButton.checked)
		{
			Main.overview.show();
			Main.overview._viewSelector._showAppsButton.checked = true;
		}
		else
			Main.overview.hide();
	},

	onClickDesktopButton: function(button, pspec)
	{
		this.tasksList.forEach(
			function(task)
			{
				let [windowTask, buttonTask, signalsTask, workspaceIndex] = task;
				if (this.desktopView && !Main.overview.visible)
				{
					windowTask.unminimize(global.get_current_time());
				}
				else
				{
					windowTask.minimize(global.get_current_time());
					if (this.settings.get_enum("active-task-style") == 2)
						buttonTask.opacity = 204;
					else if (this.settings.get_enum("active-task-style") != 0)
						buttonTask.remove_style_pseudo_class(this.style);
				}
			},
			this
		);
		this.desktopView = ! this.desktopView;
		if (Main.overview.visible)
			Main.overview.hide();
	},

	onClickTaskButton: function(button, pspec, window)
	{
		let numButton = pspec.get_button();
		if (numButton == 1) //Left Button
		{
			this.tasksList.forEach(
				function(task)
				{
					let [windowTask, buttonTask, signalsTask, workspaceIndex] = task;
					let launchWorkspace = global.screen.get_workspace_by_index(workspaceIndex);
					if (windowTask == window)
					{
						if (! windowTask.has_focus())
						{
							if (this.settings.get_boolean("display-all-workspaces"))
								launchWorkspace.activate(global.get_current_time());
							windowTask.activate(global.get_current_time());
							if (this.settings.get_enum("active-task-style") == 2)
								buttonTask.opacity = 255;
							else if (this.settings.get_enum("active-task-style") != 0)
								buttonTask.add_style_pseudo_class(this.style);
						}
						else if (!Main.overview.visible)
						{
							if (this.settings.get_boolean("display-all-workspaces"))
								launchWorkspace.activate(global.get_current_time());
							windowTask.minimize(global.get_current_time());
							if (this.settings.get_enum("active-task-style") == 2)
								buttonTask.opacity = 204;
							else if (this.settings.get_enum("active-task-style") != 0)
								buttonTask.remove_style_pseudo_class(this.style);
						}
					}
					else
					{
						if (this.settings.get_enum("active-task-style") == 2)
							buttonTask.opacity = 204;
						else if (this.settings.get_enum("active-task-style") != 0)
							buttonTask.remove_style_pseudo_class(this.style);
					}
				},
				this
			);
			this.desktopView = false;
			if (Main.overview.visible)
				Main.overview.hide();
		}
		else if (numButton == 2 && this.settings.get_enum("close-button") == 1) //Middle Button
			window.delete(global.get_current_time());
		else if (numButton == 3 && this.settings.get_enum("close-button") == 2) //Right Button
			window.delete(global.get_current_time());
	},

	onWindowsListChanged: function(windowsList, type, window)
	{
		this.desktopView = false;
		if (type == 0) //Add all windows (On init or workspace change)
		{
			this.cleanTasksList();
			this.nWorkspaces = global.screen.n_workspaces - 1;
			for (let i = 0; i < this.nWorkspaces; i++)
			{
				this.workspace = global.screen.get_workspace_by_index(i);
				this.wsindex = i;
				if (!this.settings.get_boolean("display-all-workspaces"))
				{
					this.workspace = global.screen.get_active_workspace();
					this.wsindex = global.screen.get_active_workspace().index();
					i = this.nWorkspaces;
				}
				windowsList = this.workspace.list_windows().reverse();
				windowsList.forEach(
					function(window)
					{
						this.addTaskInList(window);
					},
					this
				);
				this.desktopView = false;
				this.hidePreview();
			}
		}
		else if (type == 1) //Add window
		{
			this.addTaskInList(window);
			this.desktopView = false;
			this.onParamChanged();
		}
		else if (type == 2) //Remove window
		{
			this.removeTaskInList(window);
			this.hidePreview();
			this.onParamChanged();
		}
	},

	onWindowChanged: function(window, type)
	{
		if (type == 0) //Focus
		{
			this.tasksList.forEach(
				function(task)
				{
					let [windowTask, buttonTask, signalsTask] = task;
					if (windowTask == window)
					{
						if (this.settings.get_enum("active-task-style") == 2)
							buttonTask.opacity = 255;
						else if (this.settings.get_enum("active-task-style") != 0)
							buttonTask.add_style_pseudo_class(this.style);
					}
					else
					{
						if (this.settings.get_enum("active-task-style") == 2)
							buttonTask.opacity = 204;
						else if (this.settings.get_enum("active-task-style") != 0)
							buttonTask.remove_style_pseudo_class(this.style);
					}
				},
				this
			);
		}
		this.desktopView = false;
	},

	searchTaskInList: function(window)
	{
		let index = null;
		for (let indexTask in this.tasksList)
		{
			let [windowTask, buttonTask, signalsTask] = this.tasksList[indexTask];
			if (windowTask == window)
			{
				index = indexTask;
				break;
			}
		}
		return index;
	},

	addTaskInList: function(window)
	{
		let app = Shell.WindowTracker.get_default().get_window_app(window);
		if (app != null)
		{
			let iconTask = new AppDisplay.AppIcon(app, { setSizeManually: true, showLabel: false });
			iconTask.setIconSize(this.iconSize);
			let buttonTask = new St.Button({ style_class: "tkb-task-button" });
			buttonTask.set_child(iconTask.actor);
			let signalsTask = [
				buttonTask.connect("button-press-event", Lang.bind(this, this.onClickTaskButton, window)),
				buttonTask.connect("enter-event", Lang.bind(this, this.showPreview, window)),
				buttonTask.connect("leave-event", Lang.bind(this, this.hidePreview))
			];
			let workspaceIndex = this.wsindex;
			buttonTask.opacity = 255;
			if (this.settings.get_enum("active-task-style") == 2)
				buttonTask.opacity = 204;
			if (window.has_focus())
			{
				if (this.settings.get_enum("active-task-style") == 2)
					buttonTask.opacity = 255;
				else if (this.settings.get_enum("active-task-style") != 0)
					buttonTask.add_style_pseudo_class(this.style);
			}
			this.boxMain.add_actor(buttonTask);
			this.tasksList.push([ window, buttonTask, signalsTask, workspaceIndex ]);
		}
	},

	removeTaskInList: function(window)
	{
		let index = this.searchTaskInList(window);
		if (index != null)
		{
			let [windowTask, buttonTask, signalsTask, workspaceIndex] = this.tasksList[index];
			signalsTask.forEach(
				function(signal)
				{
					buttonTask.disconnect(signal);
				},
				this
			);
			buttonTask.destroy();
			this.tasksList.splice(index, 1);
			return true;
		}
		else
			return false;
	},

	cleanTasksList: function()
	{
		for (let i = this.tasksList.length - 1; i>=0; i--)
		{
			let [windowTask, buttonTask, signalsTask] = this.tasksList[i];
			signalsTask.forEach(
				function(signal)
				{
					buttonTask.disconnect(signal);
				},
				this
			);
			buttonTask.destroy();
			this.tasksList.splice(i, 1);
		};
	},

	getThumbnail: function(window, size)
	{
		let thumbnail = null;
		let mutterWindow = window.get_compositor_private();
		if (mutterWindow)
		{
			let windowTexture = mutterWindow.get_texture();
			let [width, height] = windowTexture.get_size();
			let scale = Math.min(1.0, size / width, size / height);
			thumbnail = new Clutter.Clone ({ source: windowTexture, reactive: true, width: width * scale, height: height * scale });
		}
		return thumbnail;
	},

	showPreview: function(button, pspec, window)
	{
		//Remove current preview if necessary
		this.hidePreview();
		if ((this.settings.get_boolean("display-label")) | (this.settings.get_boolean("display-thumbnail")))
		{
			if (this.settings.get_int("preview-delay") == 0)
				this.showPreview2(button, window);
			else
				this.previewTimer = Mainloop.timeout_add(this.settings.get_int("preview-delay"), Lang.bind(this, this.showPreview2, button, window));
		}
	},

	showPreview2: function(button, window)
	{
		//Remove current preview if necessary
		this.hidePreview();
		let app = Shell.WindowTracker.get_default().get_window_app(window);
		this.preview = new St.BoxLayout({ style_class: "tkb-preview", vertical: true});
		if (this.settings.get_boolean("display-label"))
		{
			let labelNamePreview = new St.Label({ text: app.get_name(), style_class: "tkb-preview-name" });
			this.preview.add_actor(labelNamePreview);
			let title = window.get_title();
			if (title.length > 50)
				title = title.substr(0, 47) + "...";
			let labelTitlePreview = new St.Label({ text: title, style_class: "tkb-preview-title" });
			this.preview.add_actor(labelTitlePreview);
		}
		if (this.settings.get_boolean("display-thumbnail"))
		{
			let thumbnail = this.getThumbnail(window, this.settings.get_int("preview-size"));
			this.preview.add_actor(thumbnail);
		}
		global.stage.add_actor(this.preview);
		let [left, top] = button.get_transformed_position();
		this.preview.set_position(left - 10, 30);
	},

	hidePreview: function()
	{
		//Remove preview programmed if necessary
		if (this.previewTimer != null)
		{
			Mainloop.source_remove(this.previewTimer);
			this.previewTimer = null;
		}

		//Destroy Preview if displaying
		if (this.preview != null)
		{
			this.preview.destroy();
			this.preview = null;
		}
	},

	defineBoxChanged: function()
	{
		this.panelBox = this.settings.get_int('panel-box');
		if (this.panelBox == 1)
			this.newBox = Main.panel._leftBox;
		if (this.panelBox == 2)
			this.newBox = Main.panel._centerBox;
		if (this.panelBox == 3)
			this.newBox = Main.panel._rightBox;
		this.childrenLength = this.newBox.get_children().length;
		this.settings.set_int("position-max-right", this.childrenLength);
	},

	onBoxChanged: function()
	{
		this.newBox.remove_child(this.boxMain);
		this.defineBoxChanged();
	},

	onPositionChanged: function()
	{
		this.defineBoxChanged();
		this.panelPosition = this.settings.get_int('panel-position');
		if (this.panelPosition > this.childrenLength)
			this.settings.set_int("panel-position", this.childrenLength);
		this.panelPosition = this.settings.get_int('panel-position');
		this.children = this.newBox.get_children(this.panelPosition);
		this.newBox.insert_child_at_index(this.boxMain, this.panelPosition);
	}
}

