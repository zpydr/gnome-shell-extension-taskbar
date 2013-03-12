//Code taken from 
//https://extensions.gnome.org/extension/368/taskbar-with-desktop-button-to-minimizeunminimize-/ 
//by Xes http://svn.xesnet.fr/gnomeextensions

const Gtk = imports.gi.Gtk;
const Lang = imports.lang;

const Extension = imports.misc.extensionUtils.getCurrentExtension();
const Lib = Extension.imports.lib;

const schema = "org.gnome.shell.extensions.TaskBar";

function init()
{

}

function buildPrefsWidget()
{
    let prefs = new Prefs(schema);

    return prefs.buildPrefsWidget();
}

function Prefs(schema)
{
    this.init(schema);
}

Prefs.prototype =
{
    settings: null,

    init: function(schema)
    {
	let settings = new Lib.Settings(schema);
	
	this.settings = settings.getSettings();
    },

    changeDisplayAllWorkspaces: function(object, pspec)
    {
	this.settings.set_boolean("display-all-workspaces", object.active);
    },
    
    changeDisplayDesktopButton: function(object, valueDisplayDesktopButton)
    {
	this.settings.set_enum("display-desktop-button", valueDisplayDesktopButton.get_active());
    },
    
    changeDisplayShowAppsButton: function(object, pspec)
    {
	this.settings.set_boolean("display-showapps-button", object.active);
    },

    changeDisplayOverviewButton: function(object, pspec)
    {
	this.settings.set_boolean("display-overview-button", object.active);
    },
    
    changeRemoveActivities: function(object, valueRemoveActivities)
    {
	this.settings.set_enum("remove-activities", valueRemoveActivities.get_active());
    },
    
    changeRemoveDefaultApplicationMenu: function(object, pspec)
    {
	this.settings.set_boolean("remove-default-application-menu", object.active);
    },
    
    changeCloseButton: function(object, valueCloseButton)
    {
	this.settings.set_enum("close-button", valueCloseButton.get_active());
    },
    
    changeActiveTaskStyle: function(object, valueActiveTaskStyle)
    {
	this.settings.set_enum("active-task-style", valueActiveTaskStyle.get_active());
    },
    
    changeIconSize: function(object, valueIconSize)
    {
	this.settings.set_int("icon-size", valueIconSize.get_value());
    },

	changePanelPositionLeft: function()
	{
		let panelPosition = this.settings.get_int("panel-position");
		let panelBox = this.settings.get_int("panel-box");
		let positionMaxRight = this.settings.get_int("position-max-right");
		if (panelPosition == 0) {
			if (panelBox > 1) {
				this.signalMax = this.settings.connect("changed::position-max-right", Lang.bind(this, function() {
					this.settings.disconnect(this.signalMax);
					let panelPosition = this.settings.get_int("position-max-right");
					this.settings.set_int("panel-position", panelPosition);
				})),
				this.settings.set_int("panel-box", panelBox - 1);
			}
		}
		else
			this.settings.set_int("panel-position", panelPosition - 1);
	},

	changePanelPositionRight: function()
	{
		let panelPosition = this.settings.get_int("panel-position");
		let panelBox = this.settings.get_int("panel-box");
		let positionMaxRight = this.settings.get_int("position-max-right");
		if (panelPosition >= positionMaxRight) {
			if (panelBox < 3) {
				this.settings.set_int("panel-box", panelBox + 1);
				this.settings.set_int("panel-position", 0);
			}
			else
				this.settings.set_int("panel-position", positionMaxRight);
		}
		else
			this.settings.set_int("panel-position", panelPosition + 1);
	},

    changeDisplayLabel: function(object, pspec)
    {
	this.settings.set_boolean("display-label", object.active);
    },
    
    changeDisplayThumbnail: function(object, pspec)
    {
	this.settings.set_boolean("display-thumbnail", object.active);
    },
        
    changePreviewSize: function(object, valuePreviewSize)
    {
	this.settings.set_int("preview-size", valuePreviewSize.get_value());
    },

    changePreviewDelay: function(object, valuePreviewDelay)
    {
	this.settings.set_int("preview-delay", valuePreviewDelay.get_value());
    },

    buildPrefsWidget: function()
    {
	let frame = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, border_width: 10});

	let label = new Gtk.Label({ label: "<b>Global</b>", use_markup: true, xalign: 0});
	let vbox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, margin_left: 20});

	
	
	let hboxDisplayAllWorkspaces = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5});
	let labelDisplayAllWorkspaces = new Gtk.Label({label: "Display All Workspaces", xalign: 0});
	let valueDisplayAllWorkspaces = new Gtk.Switch({active: this.settings.get_boolean("display-all-workspaces")});
	valueDisplayAllWorkspaces.connect('notify::active', Lang.bind(this, this.changeDisplayAllWorkspaces));

	hboxDisplayAllWorkspaces.pack_start(labelDisplayAllWorkspaces, true, true, 0);
	hboxDisplayAllWorkspaces.add(valueDisplayAllWorkspaces);
	vbox.add(hboxDisplayAllWorkspaces);



	let hboxDisplayDesktopButton = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5});
	let labelDisplayDesktopButton = new Gtk.Label({label: "Display Desktop Button", xalign: 0});
	let valueDisplayDesktopButton = new Gtk.ComboBoxText();
	valueDisplayDesktopButton.append_text("None");
    valueDisplayDesktopButton.append_text("Default");
    valueDisplayDesktopButton.append_text("GNOME");
    valueDisplayDesktopButton.append_text("Dark");
    valueDisplayDesktopButton.set_active(this.settings.get_enum("display-desktop-button"));
	valueDisplayDesktopButton.connect('changed', Lang.bind(this, this.changeDisplayDesktopButton, valueDisplayDesktopButton));

	hboxDisplayDesktopButton.pack_start(labelDisplayDesktopButton, true, true, 0);
	hboxDisplayDesktopButton.add(valueDisplayDesktopButton);
	vbox.add(hboxDisplayDesktopButton);



	let hboxDisplayShowAppsButton = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5});
	let labelDisplayShowAppsButton = new Gtk.Label({label: "Display Show Applications Button", xalign: 0});
	let valueDisplayShowAppsButton = new Gtk.Switch({active: this.settings.get_boolean("display-showapps-button")});
	valueDisplayShowAppsButton.connect('notify::active', Lang.bind(this, this.changeDisplayShowAppsButton));

	hboxDisplayShowAppsButton.pack_start(labelDisplayShowAppsButton, true, true, 0);
	hboxDisplayShowAppsButton.add(valueDisplayShowAppsButton);
	vbox.add(hboxDisplayShowAppsButton);



	let hboxDisplayOverviewButton = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL});
	let labelDisplayOverviewButton = new Gtk.Label({label: "Display Activities Icon Button", xalign: 0});
	let valueDisplayOverviewButton = new Gtk.Switch({active: this.settings.get_boolean("display-overview-button")});
	valueDisplayOverviewButton.connect('notify::active', Lang.bind(this, this.changeDisplayOverviewButton));

	hboxDisplayOverviewButton.pack_start(labelDisplayOverviewButton, true, true, 0);
	hboxDisplayOverviewButton.add(valueDisplayOverviewButton);
	vbox.add(hboxDisplayOverviewButton);



	let hboxRemoveActivities = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5});
	let labelRemoveActivities = new Gtk.Label({label: "Remove HotCorner/Activities", xalign: 0});
	let valueRemoveActivities = new Gtk.ComboBoxText();
	valueRemoveActivities.append_text("None");
    valueRemoveActivities.append_text("HotCorner");
    valueRemoveActivities.append_text("Activities");
    valueRemoveActivities.set_active(this.settings.get_enum("remove-activities"));
	valueRemoveActivities.connect('changed', Lang.bind(this, this.changeRemoveActivities, valueRemoveActivities));

	hboxRemoveActivities.pack_start(labelRemoveActivities, true, true, 0);
	hboxRemoveActivities.add(valueRemoveActivities);
	vbox.add(hboxRemoveActivities);



	let hboxRemoveDefaultApplicationMenu = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5});
	let labelRemoveDefaultApplicationMenu = new Gtk.Label({label: "Remove Default Application Menu", xalign: 0});
	let valueRemoveDefaultApplicationMenu = new Gtk.Switch({active: this.settings.get_boolean("remove-default-application-menu")});
	valueRemoveDefaultApplicationMenu.connect('notify::active', Lang.bind(this, this.changeRemoveDefaultApplicationMenu));

	hboxRemoveDefaultApplicationMenu.pack_start(labelRemoveDefaultApplicationMenu, true, true, 0);
	hboxRemoveDefaultApplicationMenu.add(valueRemoveDefaultApplicationMenu);
	vbox.add(hboxRemoveDefaultApplicationMenu);
	


	let hboxCloseButton = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5});
	let labelCloseButton = new Gtk.Label({label: "Close Task with Middle/Right Click", xalign: 0});
	let valueCloseButton = new Gtk.ComboBoxText();
	valueCloseButton.append_text("None");
    valueCloseButton.append_text("Middle Click");
    valueCloseButton.append_text("Right Click");
	valueCloseButton.set_active(this.settings.get_enum("close-button"));
	valueCloseButton.connect('changed', Lang.bind(this, this.changeCloseButton, valueCloseButton));

	hboxCloseButton.pack_start(labelCloseButton, true, true, 0);
	hboxCloseButton.add(valueCloseButton);
	vbox.add(hboxCloseButton);



	let hboxActiveTaskStyle = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5});
	let labelActiveTaskStyle = new Gtk.Label({label: "Active Task Style", xalign: 0});
	let valueActiveTaskStyle = new Gtk.ComboBoxText();
	valueActiveTaskStyle.append_text("None");
    valueActiveTaskStyle.append_text("Frame");
    valueActiveTaskStyle.append_text("Opacity");
    valueActiveTaskStyle.append_text("BG Color");
    valueActiveTaskStyle.set_active(this.settings.get_enum("active-task-style"));
	valueActiveTaskStyle.connect('changed', Lang.bind(this, this.changeActiveTaskStyle, valueActiveTaskStyle));

	hboxActiveTaskStyle.pack_start(labelActiveTaskStyle, true, true, 0);
	hboxActiveTaskStyle.add(valueActiveTaskStyle);
	vbox.add(hboxActiveTaskStyle);
	

	
	let hboxIconSize = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5});
	let labelIconSize = new Gtk.Label({label: "Icon Size ", xalign: 0});
	let valueIconSize = new Gtk.Adjustment({lower: 1, upper: 96, step_increment: 1});
	let value2IconSize = new Gtk.SpinButton({adjustment: valueIconSize, snap_to_ticks: true});
	value2IconSize.set_value(this.settings.get_int("icon-size"));
	value2IconSize.connect("value-changed", Lang.bind(this, this.changeIconSize, valueIconSize));

	hboxIconSize.pack_start(labelIconSize, true, true, 0);
	hboxIconSize.add(value2IconSize);
	vbox.add(hboxIconSize);



 	let hboxPanelPosition = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5});
 	let labelPanelPosition = new Gtk.Label({label: "Position on Panel", xalign: 0});
	let valuePanelPosition = new Gtk.Button({image: new Gtk.Image({icon_name: 'back'})});
	let value2PanelPosition = new Gtk.Button({image: new Gtk.Image({icon_name: 'forward'})});
	valuePanelPosition.connect('clicked', Lang.bind(this, this.changePanelPositionLeft));
	value2PanelPosition.connect('clicked', Lang.bind(this, this.changePanelPositionRight));

    hboxPanelPosition.pack_start(labelPanelPosition, true, true, 0);
	hboxPanelPosition.add(valuePanelPosition);
	hboxPanelPosition.add(value2PanelPosition);
	vbox.add(hboxPanelPosition);
		


	frame.add(label);
	frame.add(vbox);

	label = new Gtk.Label({ label: "\n<b>Preview</b>", use_markup: true, xalign: 0 });
	vbox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, margin_left: 20 });



	let hboxDisplayLabel = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5});
	let labelDisplayLabel = new Gtk.Label({label: "Display Label", xalign: 0});
	let valueDisplayLabel = new Gtk.Switch({active: this.settings.get_boolean("display-label")});
	valueDisplayLabel.connect('notify::active', Lang.bind(this, this.changeDisplayLabel));

	hboxDisplayLabel.pack_start(labelDisplayLabel, true, true, 0);
	hboxDisplayLabel.add(valueDisplayLabel);
	vbox.add(hboxDisplayLabel);



	let hboxDisplayThumbnail = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL});
	let labelDisplayThumbnail = new Gtk.Label({label: "Display Thumbnail", xalign: 0});
	let valueDisplayThumbnail = new Gtk.Switch({active: this.settings.get_boolean("display-thumbnail")});
	valueDisplayThumbnail.connect('notify::active', Lang.bind(this, this.changeDisplayThumbnail));

	hboxDisplayThumbnail.pack_start(labelDisplayThumbnail, true, true, 0);
	hboxDisplayThumbnail.add(valueDisplayThumbnail);
	vbox.add(hboxDisplayThumbnail);
	

	
	let hboxPreviewSize = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5});
	let labelPreviewSize = new Gtk.Label({label: "Preview Size ", xalign: 0});
	let valuePreviewSize = new Gtk.Adjustment({lower: 100, upper: 1000, step_increment: 50});
	let value2PreviewSize = new Gtk.SpinButton({adjustment: valuePreviewSize, snap_to_ticks: true});
	value2PreviewSize.set_value(this.settings.get_int("preview-size"));
	value2PreviewSize.connect("value-changed", Lang.bind(this, this.changePreviewSize, valuePreviewSize));

	hboxPreviewSize.pack_start(labelPreviewSize, true, true, 0);
	hboxPreviewSize.add(value2PreviewSize);

	vbox.add(hboxPreviewSize);



	let hboxPreviewDelay = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5});
	let labelPreviewDelay = new Gtk.Label({label: "Delay before Preview (milliseconds)", xalign: 0});
	let valuePreviewDelay = new Gtk.Adjustment({lower: 0, upper: 3000, step_increment: 250});
	let value2PreviewDelay = new Gtk.SpinButton({adjustment: valuePreviewDelay, snap_to_ticks: true});
	value2PreviewDelay.set_value(this.settings.get_int("preview-delay"));
	value2PreviewDelay.connect("value-changed", Lang.bind(this, this.changePreviewDelay, valuePreviewDelay));

	hboxPreviewDelay.pack_start(labelPreviewDelay, true, true, 0);
	hboxPreviewDelay.add(value2PreviewDelay);

	vbox.add(hboxPreviewDelay);



	frame.add(label);
	frame.add(vbox);
	frame.show_all();
	
	return frame;
    }
}
