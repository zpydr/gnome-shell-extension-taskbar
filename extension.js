//  GNOME Shell Extension TaskBar
//  Copyright (C) 2013 zpydr
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.
//
//  zpydr@linuxwaves.com

const Clutter = imports.gi.Clutter;
const Gdk = imports.gi.Gdk;
const GdkPixbuf = imports.gi.GdkPixbuf;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Shell = imports.gi.Shell;
const St = imports.gi.St;

const AppFavorites = imports.ui.appFavorites;
const Layout = imports.ui.layout;
const Main = imports.ui.main;
const Panel = imports.ui.main.panel;

const Extension = imports.misc.extensionUtils.getCurrentExtension();
const Lib = Extension.imports.lib;
const Prefs = Extension.imports.prefs;
const ShellVersion = imports.misc.config.PACKAGE_VERSION.split(".").map(function (x) { return + x; });
const Windows = Extension.imports.windows;
const Windows34 = Extension.imports.windows34;

const schema = "org.gnome.shell.extensions.TaskBar";

const LEFTBUTTON = 1;
const MIDDLEBUTTON = 2;
const RIGHTBUTTON = 3;
const NOHOTCORNER = 54321;

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
    previewTimer2: null,
    preview: null,
    favoriteapp: null,
    h: null,

    init: function(extensionMeta, schema)
    {
        this.extensionMeta = extensionMeta;
        this.schema = schema;
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

        //First Start
        this.firstStart();

        //Add TaskBar
        this.iconSize = this.settings.get_int('icon-size');
        this.boxMain = new St.BoxLayout({ style_class: "tkb-box" });
        this.boxMainFavorites = new St.BoxLayout({ style_class: "tkb-box" });
        this.boxMainShowAppsButton = new St.BoxLayout({ style_class: "tkb-box" });
        this.boxMainWorkspaceButton = new St.BoxLayout({ style_class: "tkb-box" });
        this.boxMainDesktopButton = new St.BoxLayout({ style_class: "tkb-box" });
        this.boxMainTasks = new St.BoxLayout({ style_class: "tkb-box" });
        this.boxMainSeparatorOne = new St.BoxLayout({ style_class: "tkb-box" });
        this.boxMainSeparatorTwo = new St.BoxLayout({ style_class: "tkb-box" });
        this.boxMainSeparatorThree = new St.BoxLayout({ style_class: "tkb-box" });
        this.boxMainSeparatorFour = new St.BoxLayout({ style_class: "tkb-box" });
        this.boxMainSeparatorFive = new St.BoxLayout({ style_class: "tkb-box" });
        this.boxMainSeparatorSix = new St.BoxLayout({ style_class: "tkb-box" });
        this.onPositionChanged();

        //Add Favorites
        this.addFavorites();

        //Add Show Apps Button
        this.addShowAppsButton();

        //Add Workspace Button
        this.addWorkspaceButton();

        //Add Desktop Button
        this.addDesktopButton();

        //Add Separators
        this.addSeparators();

        //Hide Activities
        this.initHideActivities();

        //Disable Hot Corner
        if ((ShellVersion[1] === 8) || (ShellVersion[1] === 10))
        {
            //Extended Barriers Support
            this.barriers = global.display.supports_extended_barriers();

            this.threshold = Main.layoutManager.hotCorners[Main.layoutManager.primaryIndex]._pressureBarrier._threshold;
            this.toggleOverview = Main.layoutManager.hotCorners[Main.layoutManager.primaryIndex]._toggleOverview;
        }
        this.initDisableHotCorner();

        //Hide Default Application Menu
        this.initHideDefaultAppMenu();

        //Active Task Frame / Background Color
        this.activeTaskFrame();

        //Init Windows Manage Callbacks
        if (((ShellVersion[1] === 4) || (ShellVersion[1] === 6)) && (! this.settings.get_boolean("tasks-all-workspaces")))
            this.windows = new Windows34.Windows(this, this.onWindowsListChanged, this.onWindowChanged);
        else
            this.windows = new Windows.Windows(this, this.onWindowsListChanged, this.onWindowChanged);

        //Order of Appearance
        this.appearanceOrder();

        //Preferences Hover Event        
        this.hoverEvent();
        this.hoverSeparatorEvent();

        //Reinit Extension on Param Change
        this.setSignals();
    },

    disable: function()
    {
        //Show Activities if hidden
        if (this.settings.get_boolean("hide-activities"))
            this.activitiesActor.show();

        //Enable Hot Corner if disabled
        if (this.settings.get_boolean("disable-hotcorner"))
        {
            if (ShellVersion[1] === 4)
                Main.panel._activitiesButton._hotCorner._corner.show();
            else if (ShellVersion[1] === 6)
                Main.panel.statusArea.activities.hotCorner._corner.show();
            else if ((ShellVersion[1] === 8) || (ShellVersion[1] === 10))
            {
                if (this.barriers)
                    Main.layoutManager.hotCorners[Main.layoutManager.primaryIndex]._pressureBarrier._threshold = this.threshold;
                else
                    Main.layoutManager.hotCorners[Main.layoutManager.primaryIndex]._toggleOverview = this.toggleOverview;
            }
        }

        //Show and disconnect Default Application Menu if hidden
        if (this.settings.get_boolean("hide-default-application-menu"))
        {
            this.appMenuActor.show();
            if (ShellVersion[1] === 10)
                Shell.WindowTracker.get_default().disconnect(this.hidingId2);
            Main.overview.disconnect(this.hidingId);
        }

        //Disconnect Workspace Signals
        if (this.workspaceSwitchedId != null)
        {
            global.screen.disconnect(this.workspaceSwitchedId);
            this.workspaceSwitchedId = null;
        }
        if (this.nWorkspacesId != null)
        {
            global.screen.disconnect(this.nWorkspacesId);
            this.nWorkspacesId = null;
        }

        //Disconnect Favorites Signals
        if (this.installedChangedId != null)
        {
            Shell.AppSystem.get_default().disconnect(this.installedChangedId);
            this.installedChangedId = null;
        }
        if (this.changedId != null)
        {
            AppFavorites.getAppFavorites().disconnect(this.changedId);
            this.changedId = null;
        }

        //Disconnect Fullscreen Signal
        if (this.fullscreenChangedId != null)
        {
            if (ShellVersion[1] === 10)
                global.screen.disconnect(this.fullscreenChangedId);
            else
                Main.layoutManager.disconnect(this.fullscreenChangedId);
            this.fullscreenChangedId = null;
        }

        //Disconnect Setting Signals
        if (this.settingSignals != null) 
        {
            this.settingSignals.forEach(
                function(signal)
                {
                    this.settings.disconnect(signal);
                },
                this
            );
            this.settingSignals = null;
        }
        
        //Hide current preview if necessary
        this.hidePreview();

        //Remove TaskBar
        this.windows.destruct();
        this.windows = null;
        if (this.bottomPanelActor != null)
            this.bottomPanelActor.destroy();
        this.bottomPanelActor = null;
        Main.messageTray.actor.set_anchor_point(0, 0);
        if (ShellVersion[1] !== 4)
            Main.messageTray._notificationWidget.set_anchor_point(0, 0);
        if (this.newBox != null)
            this.newBox.remove_child(this.boxMain);
        this.boxMain = null;
        this.newBox = null;
        this.cleanTasksList();
    },

    setSignals: function()
    {
        //Reinit Extension on Param Change
        this.settingSignals =
        [
            this.settings.connect("changed::icon-size", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::icon-size-bottom", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::font-size", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::font-size-bottom", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::panel-box", Lang.bind(this, this.onBoxChanged)),
            this.settings.connect("changed::panel-position", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::display-favorites", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::display-showapps-button", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::display-workspace-button", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::workspace-button-index", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::display-desktop-button", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::desktop-button-icon", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::text-buttons", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::appview-button-icon", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::active-task-frame", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::active-task-background-color", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::active-task-background-color-set", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::display-tasks", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::hide-activities", Lang.bind(this, this.hideActivities)),
            this.settings.connect("changed::disable-hotcorner", Lang.bind(this, this.disableHotCorner)),
            this.settings.connect("changed::hide-default-application-menu", Lang.bind(this, this.hideDefaultAppMenu)),
            this.settings.connect("changed::position-tasks", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::position-desktop-button", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::position-workspace-button", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::position-appview-button", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::position-favorites", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::bottom-panel", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::bottom-panel-vertical", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::position-bottom-box", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::tasks-all-workspaces", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-one", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-two", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-three", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-four", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-five", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-six", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-one-bottom", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-two-bottom", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-three-bottom", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-four-bottom", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-five-bottom", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-six-bottom", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-one-size", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-two-size", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-three-size", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-four-size", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-five-size", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-six-size", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-one-bottom-size", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-two-bottom-size", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-three-bottom-size", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-four-bottom-size", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-five-bottom-size", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-six-bottom-size", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::hover-event", Lang.bind(this, this.hoverEvent)),
            this.settings.connect("changed::hover-separator-event", Lang.bind(this, this.hoverSeparatorEvent))
        ];
    },

    //First Start
    firstStart: function()
    {
        if (ShellVersion[1] === 4)
        {
            if (this.settings.get_boolean("first-start"))
            {
                Main.Util.trySpawnCommandLine('gnome-shell-extension-prefs ' + Extension.metadata.uuid);
                this.settings.set_boolean("first-start", false);
            }
        }
        else
        {
            if ((this.settings.get_boolean("first-start")) && (Main.sessionMode.currentMode == 'user'))
            {
                Main.Util.trySpawnCommandLine('gnome-shell-extension-prefs ' + Extension.metadata.uuid);
                this.settings.set_boolean("first-start", false);
            }
        }
    },

    //Align Position
    onPositionChanged: function()
    {
        if (this.settings.get_boolean("bottom-panel"))
            this.bottomPanel();
        else
        {
            this.defineBoxChanged();
            this.panelPosition = this.settings.get_int('panel-position');
            if (this.panelPosition > this.children)
                this.settings.set_int("panel-position", this.children);
            this.newBox.insert_child_at_index(this.boxMain, this.panelPosition);
        }
    },

    defineBoxChanged: function()
    {
        this.panelBox = this.settings.get_int('panel-box');
        if (this.panelBox == 1)
            this.newBox = Main.panel._leftBox;
        else if (this.panelBox == 2)
            this.newBox = Main.panel._centerBox;
        else if (this.panelBox == 3)
            this.newBox = Main.panel._rightBox;
        this.children = this.newBox.get_children().length;
        let positionMaxRight = this.settings.get_int("position-max-right");
        if (positionMaxRight !== this.children)
            this.settings.set_int("position-max-right", this.children);
    },

    onBoxChanged: function()
    {
        this.newBox.remove_child(this.boxMain);
        this.defineBoxChanged();
    },

    appearanceOrder: function()
    {
        this.appearances =
        [
            ("position-tasks"),
            ("position-desktop-button"),
            ("position-workspace-button"),
            ("position-appview-button"),
            ("position-favorites")
        ];
        this.boxMain.add_actor(this.boxMainSeparatorOne);
        for (let i = 0; i <= 4; i++)
        {
            this.appearances.forEach(
                function(appearance)
                {
                    let positionAppearance = this.settings.get_int(appearance);
                    if (positionAppearance == i)
                    {
                        if (appearance == "position-tasks")
                            this.boxMain.add_actor(this.boxMainTasks);
                        else if (appearance == "position-desktop-button")
                            this.boxMain.add_actor(this.boxMainDesktopButton);
                        else if (appearance == "position-workspace-button")
                            this.boxMain.add_actor(this.boxMainWorkspaceButton);
                        else if (appearance == "position-appview-button")
                            this.boxMain.add_actor(this.boxMainShowAppsButton);
                        else if (appearance == "position-favorites")
                            this.boxMain.add_actor(this.boxMainFavorites);
                    }
                },
                this
            );
            if (i == 0)
                this.boxMain.add_actor(this.boxMainSeparatorTwo);
            else if (i == 1)
                this.boxMain.add_actor(this.boxMainSeparatorThree);
            else if (i == 2)
                this.boxMain.add_actor(this.boxMainSeparatorFour);
            else if (i == 3)
                this.boxMain.add_actor(this.boxMainSeparatorFive);
            else if (i == 4)
                this.boxMain.add_actor(this.boxMainSeparatorSix);
        }    
    },

    //Add Favorites
    addFavorites: function(buttonfavorite, favoriteapp)
    {
        this.installedChangedId = null;
        this.changedId = null;
        if (this.settings.get_boolean("display-favorites"))
        {
            //Connect Favorites Changes
            this.installedChangedId = Shell.AppSystem.get_default().connect('installed-changed', Lang.bind(this, this.onParamChanged));
            this.changedId = AppFavorites.getAppFavorites().connect('changed', Lang.bind(this, this.onParamChanged));

            let favorites = global.settings.get_strv(AppFavorites.getAppFavorites().FAVORITE_APPS_KEY);
            for (let i=0; i<favorites.length; ++i)
            {
                let favoriteapp = Shell.AppSystem.get_default().lookup_app(favorites[i]);
                if (favoriteapp == null)
                {
                    continue;
                }
                let buttonfavorite = new St.Button({ style_class: "tkb-task-button", child: favoriteapp.create_icon_texture(this.iconSize) });
                buttonfavorite.connect('clicked', Lang.bind(this, function()
                {
                    favoriteapp.open_new_window(-1);
                }, favoriteapp));
                buttonfavorite.connect("enter-event", Lang.bind(this, function()
                {
                    //Hide current preview if necessary
                    this.hidePreview();
                    if (this.settings.get_boolean("display-favorites-label"))
                    {
                        if (this.settings.get_int("preview-delay") == 0)
                            this.showFavoritesPreview(buttonfavorite, favoriteapp);
                        else
                            this.previewTimer = Mainloop.timeout_add(this.settings.get_int("preview-delay"),
                                Lang.bind(this, this.showFavoritesPreview, buttonfavorite, favoriteapp));
                    }
                }, buttonfavorite, favoriteapp));
                buttonfavorite.connect("leave-event", Lang.bind(this, this.hidePreview));
                this.boxMainFavorites.add_actor(buttonfavorite);
            }
        }
    },

    //Add Appview Button
    addShowAppsButton: function()
    {
        if (this.settings.get_boolean("display-showapps-button"))
        {
            let iconPath = this.settings.get_string("appview-button-icon");
            let pixbuf;
            try
            {
                pixbuf = GdkPixbuf.Pixbuf.new_from_file(iconPath);
            }
            catch (e)
            {
                iconPath = this.extensionMeta.path + '/images/appview-button-default.svg';
                this.settings.set_string("appview-button-icon", iconPath);
            }
            this.showAppsIcon = Gio.icon_new_for_string(iconPath);
            this.iconShowApps = new St.Icon(
            {
                gicon: this.showAppsIcon,
                icon_size: (this.iconSize + 2),
                style_class: "tkb-desktop-icon"
            });
            this.buttonShowApps = new St.Button({ style_class: "tkb-task-button" });
            this.signalShowApps = this.buttonShowApps.connect("button-press-event", Lang.bind(this, this.onClickShowAppsButton));
            this.buttonShowApps.set_child(this.iconShowApps);
            this.boxShowApps = new St.BoxLayout({ style_class: "tkb-desktop-box" });
            this.boxShowApps.add_actor(this.buttonShowApps);
            this.boxMainShowAppsButton.add_actor(this.boxShowApps);
        }
    },

    //Add Workspace Button
    addWorkspaceButton: function()
    {
        this.workspaceSwitchedId = null;
        this.nWorkspacesId = null;
        if (this.settings.get_boolean("display-workspace-button"))
        {
            //Connect Workspace Changes
            this.workspaceSwitchedId = global.screen.connect('workspace-switched', Lang.bind(this, this.updateWorkspaces));
            this.nWorkspacesId = global.screen.connect('notify::n-workspaces', Lang.bind(this, this.updateWorkspaces));

            this.buttonWorkspace = new St.Button({ style_class: "tkb-task-button" });
            this.buttonWorkspace.connect("button-press-event", Lang.bind(this, this.onClickWorkspaceButton));
            this.buttonWorkspace.connect("scroll-event", Lang.bind(this, this.onScrollWorkspaceButton));
            this.updateWorkspaces();
            this.boxWorkspace = new St.BoxLayout({ style_class: "tkb-desktop-box" });
            this.boxWorkspace.add_actor(this.buttonWorkspace);
            this.boxMainWorkspaceButton.add_actor(this.boxWorkspace);
        }
    },

    updateWorkspaces: function()
    {
        this.activeWorkspaceIndex = global.screen.get_active_workspace().index();
        this.totalWorkspace = global.screen.n_workspaces - 1;
        let labelWorkspaceIndex = this.activeWorkspaceIndex + 1;
        let labelTotalWorkspace = this.totalWorkspace + 1;
        if (this.settings.get_enum("workspace-button-index") == 1)
            this.labelWorkspace = new St.Label({ text: (labelWorkspaceIndex+"/"+labelTotalWorkspace) });
        else if (this.settings.get_enum("workspace-button-index") == 0)
            this.labelWorkspace = new St.Label({ text: (labelWorkspaceIndex+"") });
        if (this.settings.get_boolean("bottom-panel"))
            this.fontSize = this.settings.get_int('font-size-bottom');
        else
            this.fontSize = this.settings.get_int('font-size');
        this.labelWorkspace.style = 'font-size: ' + this.fontSize + 'px' + ';';
        this.buttonWorkspace.set_child(this.labelWorkspace);
    },

    //Add Desktop Button
    addDesktopButton: function()
    {
        if (this.settings.get_boolean("display-desktop-button"))
        {
            let iconPath = this.settings.get_string("desktop-button-icon");
            let pixbuf;
            try
            {
                pixbuf = GdkPixbuf.Pixbuf.new_from_file(iconPath);
            }
            catch (e)
            {
                iconPath = this.extensionMeta.path + '/images/desktop-button-default.png';
                this.settings.set_string("desktop-button-icon", iconPath);
            }
            this.desktopButtonIcon = Gio.icon_new_for_string(iconPath);
            let iconDesktop = new St.Icon(
            {
                gicon: this.desktopButtonIcon,
                icon_size: (this.iconSize + 2),
                style_class: "tkb-desktop-icon"
            });
            let buttonDesktop = new St.Button({ style_class: "tkb-task-button" });
            let signalDesktop = buttonDesktop.connect("button-press-event", Lang.bind(this, this.onClickDesktopButton));
            buttonDesktop.set_child(iconDesktop);
            let boxDesktop = new St.BoxLayout({ style_class: "tkb-desktop-box" });
            boxDesktop.add_actor(buttonDesktop);
            this.boxMainDesktopButton.add_actor(boxDesktop);
        }
    },

    //Add Separators
    addSeparators: function()
    {
        if (((! this.settings.get_boolean("bottom-panel")) && (this.settings.get_boolean("separator-one"))) ||
            ((this.settings.get_boolean("bottom-panel")) && (this.settings.get_boolean("separator-one-bottom"))))
        {
            if (this.settings.get_boolean("bottom-panel"))
                this.separatorOneWidth = this.settings.get_int("separator-one-bottom-size");
            else
                this.separatorOneWidth = this.settings.get_int("separator-one-size");
            this.boxSeparatorOne = new St.BoxLayout({ style_class: "tkb-desktop-box" });
            this.boxSeparatorOne.set_width(this.separatorOneWidth);
            this.boxMainSeparatorOne.add_actor(this.boxSeparatorOne);
        }
        if (((! this.settings.get_boolean("bottom-panel")) && (this.settings.get_boolean("separator-two"))) ||
            ((this.settings.get_boolean("bottom-panel")) && (this.settings.get_boolean("separator-two-bottom"))))
        {
            if (this.settings.get_boolean("bottom-panel"))
                this.separatorTwoWidth = this.settings.get_int("separator-two-bottom-size");
            else
                this.separatorTwoWidth = this.settings.get_int("separator-two-size");
            this.boxSeparatorTwo = new St.BoxLayout({ style_class: "tkb-desktop-box" });
            this.boxSeparatorTwo.set_width(this.separatorTwoWidth);
            this.boxMainSeparatorTwo.add_actor(this.boxSeparatorTwo);
        }
        if (((! this.settings.get_boolean("bottom-panel")) && (this.settings.get_boolean("separator-three"))) ||
            ((this.settings.get_boolean("bottom-panel")) && (this.settings.get_boolean("separator-three-bottom"))))
        {
            if (this.settings.get_boolean("bottom-panel"))
                this.separatorThreeWidth = this.settings.get_int("separator-three-bottom-size");
            else
                this.separatorThreeWidth = this.settings.get_int("separator-three-size");
            this.boxSeparatorThree = new St.BoxLayout({ style_class: "tkb-desktop-box" });
            this.boxSeparatorThree.set_width(this.separatorThreeWidth);
            this.boxMainSeparatorThree.add_actor(this.boxSeparatorThree);
        }
        if (((! this.settings.get_boolean("bottom-panel")) && (this.settings.get_boolean("separator-four"))) ||
            ((this.settings.get_boolean("bottom-panel")) && (this.settings.get_boolean("separator-four-bottom"))))
        {
            if (this.settings.get_boolean("bottom-panel"))
                this.separatorFourWidth = this.settings.get_int("separator-four-bottom-size");
            else
                this.separatorFourWidth = this.settings.get_int("separator-four-size");
            this.boxSeparatorFour = new St.BoxLayout({ style_class: "tkb-desktop-box" });
            this.boxSeparatorFour.set_width(this.separatorFourWidth);
            this.boxMainSeparatorFour.add_actor(this.boxSeparatorFour);
        }
        if (((! this.settings.get_boolean("bottom-panel")) && (this.settings.get_boolean("separator-five"))) ||
            ((this.settings.get_boolean("bottom-panel")) && (this.settings.get_boolean("separator-five-bottom"))))
        {
            if (this.settings.get_boolean("bottom-panel"))
                this.separatorFiveWidth = this.settings.get_int("separator-five-bottom-size");
            else
                this.separatorFiveWidth = this.settings.get_int("separator-five-size");
            this.boxSeparatorFive = new St.BoxLayout({ style_class: "tkb-desktop-box" });
            this.boxSeparatorFive.set_width(this.separatorFiveWidth);
            this.boxMainSeparatorFive.add_actor(this.boxSeparatorFive);
        }
        if (((! this.settings.get_boolean("bottom-panel")) && (this.settings.get_boolean("separator-six"))) ||
            ((this.settings.get_boolean("bottom-panel")) && (this.settings.get_boolean("separator-six-bottom"))))
        {
            if (this.settings.get_boolean("bottom-panel"))
                this.separatorSixWidth = this.settings.get_int("separator-six-bottom-size");
            else
                this.separatorSixWidth = this.settings.get_int("separator-six-size");
            this.boxSeparatorSix = new St.BoxLayout({ style_class: "tkb-desktop-box" });
            this.boxSeparatorSix.set_width(this.separatorSixWidth);
            this.boxMainSeparatorSix.add_actor(this.boxSeparatorSix);
        }
    },

    //Hide Activities
    hideActivities: function()
    {
        this.initHideActivities();
        if (! this.settings.get_boolean("hide-activities"))
            this.activitiesActor.show();
    },

    initHideActivities: function()
    {
        if (this.settings.get_boolean("hide-activities"))
        {
            if (ShellVersion[1] === 4)
                this.activitiesActor = Main.panel._activitiesButton.actor;
            else
                this.activitiesActor = Main.panel.statusArea.activities.actor;
            this.activitiesActor.hide();
        }
    },

    //Disable Hot Corner
    disableHotCorner: function()
    {
        this.initDisableHotCorner();
        if (! this.settings.get_boolean("disable-hotcorner"))
        {
            if ((ShellVersion[1] === 4) && (! this.settings.get_boolean("hide-activities")))
                    Main.panel._activitiesButton._hotCorner._corner.show();
            else if ((ShellVersion[1] === 6) && (! this.settings.get_boolean("hide-activities")))
                Main.panel.statusArea.activities.hotCorner._corner.show();
            else if ((ShellVersion[1] === 8) || (ShellVersion[1] === 10))
            {
                if (this.barriers)
                    Main.layoutManager.hotCorners[Main.layoutManager.primaryIndex]._pressureBarrier._threshold = this.threshold;
                else
                    Main.layoutManager.hotCorners[Main.layoutManager.primaryIndex]._toggleOverview = this.toggleOverview;
            }
        }
    },

    initDisableHotCorner: function()
    {
        if (this.settings.get_boolean("disable-hotcorner"))
        {
            if ((ShellVersion[1] === 4) && (! this.settings.get_boolean("hide-activities")))
                Main.panel._activitiesButton._hotCorner._corner.hide();
            else if ((ShellVersion[1] === 6) && (! this.settings.get_boolean("hide-activities")))
                Main.panel.statusArea.activities.hotCorner._corner.hide();
            else if ((ShellVersion[1] === 8) || (ShellVersion[1] === 10))
            {
                if (this.barriers)
                    Main.layoutManager.hotCorners[Main.layoutManager.primaryIndex]._pressureBarrier._threshold = NOHOTCORNER;
                else
                    Main.layoutManager.hotCorners[Main.layoutManager.primaryIndex]._toggleOverview = NOHOTCORNER;
            }
        }
    },

    //Hide Default Application Menu
    hideDefaultAppMenu: function()
    {
        this.initHideDefaultAppMenu();
        if (! this.settings.get_boolean("hide-default-application-menu"))
        {
            let variant = GLib.Variant.new('a{sv}', { 'Gtk/ShellShowsAppMenu': GLib.Variant.new('i', 1) });
            let xsettings = new Gio.Settings({ schema: 'org.gnome.settings-daemon.plugins.xsettings' });
            xsettings.set_value('overrides', variant);
            this.appMenuActor.show();
            if (ShellVersion[1] === 10)
                Shell.WindowTracker.get_default().disconnect(this.hidingId2);
            Main.overview.disconnect(this.hidingId);
        }
    },

    initHideDefaultAppMenu: function()
    {
        if (ShellVersion[1] === 4)
        {
            if (Main.panel._appMenu != null)
            {
                this.appMenuActor = Main.panel._appMenu.actor;
                if (this.settings.get_boolean("hide-default-application-menu"))
                {
                    let variant = GLib.Variant.new('a{sv}', { 'Gtk/ShellShowsAppMenu': GLib.Variant.new('i', 0) });
                    let xsettings = new Gio.Settings({ schema: 'org.gnome.settings-daemon.plugins.xsettings' });
                    xsettings.set_value('overrides', variant);
                    this.appMenuActor.hide();
                    this.hidingId = Main.overview.connect('hiding', function ()
                    {
                        Main.panel._appMenu.actor.hide();
                    });
                }
            }
        }
        else if (ShellVersion[1] === 10)
        {
            this.appMenuActor = Main.panel.statusArea.appMenu.actor;
            if (this.settings.get_boolean("hide-default-application-menu"))
            {
                this.appMenuActor.hide();
                this.hidingId = Main.overview.connect('hiding', function ()
                {
                    Main.panel.statusArea.appMenu.actor.hide();
                });
                this.hidingId2 = Shell.WindowTracker.get_default().connect('notify::focus-app', function ()
                {
                    Main.panel.statusArea.appMenu.actor.hide();
                });
            }
        }
        else
        {
            this.appMenuActor = Main.panel.statusArea.appMenu.actor;
            if (this.settings.get_boolean("hide-default-application-menu"))
            {
                let variant = GLib.Variant.new('a{sv}', { 'Gtk/ShellShowsAppMenu': GLib.Variant.new('i', 0) });
                let xsettings = new Gio.Settings({ schema: 'org.gnome.settings-daemon.plugins.xsettings' });
                xsettings.set_value('overrides', variant);
                this.appMenuActor.hide();
                this.hidingId = Main.overview.connect('hiding', function ()
                {
                    Main.panel.statusArea.appMenu.actor.hide();
                });
            }
        }
    },

    //Preferences Hover Component Event
    hoverEvent: function()
    {
        this.hoverComponent = this.settings.get_int("hover-event");
        this.hoverStyle = "background-color: red; border-radius: 5px";
        if (this.hoverComponent === 1)
            this.boxMainTasks.set_style(this.hoverStyle);
        else if (this.hoverComponent === 2)
            this.boxMainDesktopButton.set_style(this.hoverStyle);
        else if (this.hoverComponent === 3)
            this.boxMainWorkspaceButton.set_style(this.hoverStyle);
        else if (this.hoverComponent === 4)
            this.boxMainShowAppsButton.set_style(this.hoverStyle);
        else if (this.hoverComponent === 5)
            this.boxMainFavorites.set_style(this.hoverStyle);
        else if (this.hoverComponent === 0)
        {
            this.boxMainTasks.set_style("None");
            this.boxMainDesktopButton.set_style("None");
            this.boxMainWorkspaceButton.set_style("None");
            this.boxMainShowAppsButton.set_style("None");
            this.boxMainFavorites.set_style("None");
        }
    },

    //Preferences Hover Separator Event
    hoverSeparatorEvent: function()
    {
        this.hoverSeparator = this.settings.get_int("hover-separator-event");
        this.hoverSeparatorStyle = "background-color: red; border-radius: 5px";
        if (this.hoverSeparator === 1)
            this.boxMainSeparatorOne.set_style(this.hoverSeparatorStyle);
        else if (this.hoverSeparator === 2)
            this.boxMainSeparatorTwo.set_style(this.hoverSeparatorStyle);
        else if (this.hoverSeparator === 3)
            this.boxMainSeparatorThree.set_style(this.hoverSeparatorStyle);
        else if (this.hoverSeparator === 4)
            this.boxMainSeparatorFour.set_style(this.hoverSeparatorStyle);
        else if (this.hoverSeparator === 5)
            this.boxMainSeparatorFive.set_style(this.hoverSeparatorStyle);
        else if (this.hoverSeparator === 6)
            this.boxMainSeparatorSix.set_style(this.hoverSeparatorStyle);
        else if (this.hoverSeparator === 0)
        {
            this.boxMainSeparatorOne.set_style("None");
            this.boxMainSeparatorTwo.set_style("None");
            this.boxMainSeparatorThree.set_style("None");
            this.boxMainSeparatorFour.set_style("None");
            this.boxMainSeparatorFive.set_style("None");
            this.boxMainSeparatorSix.set_style("None");
        }
    },

    //Active Task Frame / Background Color
    activeTaskFrame: function()
    {
        this.backgroundColor = this.settings.get_string("active-task-background-color");
        if (this.settings.get_boolean("active-task-background-color-set"))
            this.backgroundStyleColor = "background-color: " + this.backgroundColor;
        else
            this.backgroundStyleColor = "None";
        if (this.settings.get_boolean("active-task-frame"))
            this.activeTask = "active-task-frame";
        else
            this.activeTask = "active-task-no-frame";
    },

    //Bottom Panel
    bottomPanel: function(h)
    {
        this.iconSize = this.settings.get_int('icon-size-bottom');
        this.bottomPanelVertical = this.settings.get_int('bottom-panel-vertical');
        this.fullscreenChangedId = null;
        this.bottomPanelActor = new St.BoxLayout({ style_class: 'bottom-panel',
                                                   name: 'bottomPanel'});
        if (ShellVersion[1] === 4)
        {
            this.bottomPanelActor.set_reactive(false);
            this.bottomPanelActor.add_actor(this.boxMain);
        }
        else
        {
            this.bottomPanelActor.set_reactive(true);
            this.positionBoxBottomSettings = this.settings.get_int("position-bottom-box");
            if (this.positionBoxBottomSettings === 0)
                this.positionBoxBottom = new St.Bin({ x_expand: true, x_align: St.Align.START });
            if (this.positionBoxBottomSettings === 1)
                this.positionBoxBottom = new St.Bin({ x_expand: true, x_align: St.Align.MIDDLE });
            if (this.positionBoxBottomSettings === 2)
                this.positionBoxBottom = new St.Bin({ x_expand: true, x_align: St.Align.END });
            this.positionBoxBottom.add_actor(this.boxMain);
            this.bottomPanelActor.add_actor(this.positionBoxBottom);
        }
        Main.layoutManager.addChrome(this.bottomPanelActor, { affectsStruts: true });
        let primary = Main.layoutManager.primaryMonitor;
        h = (this.iconSize + this.bottomPanelVertical + 4);
        this.bottomPanelActor.set_position(primary.x, primary.y+primary.height-h);
        this.bottomPanelActor.set_size(primary.width, -1);
        Main.messageTray.actor.set_anchor_point(0, h);
        if (ShellVersion[1] !== 4)
            Main.messageTray._notificationWidget.set_anchor_point(0, h);
        if (ShellVersion[1] === 10)
        {
            this.fullscreenChangedId = global.screen.connect('in-fullscreen-changed', Lang.bind(this, function()
            {
                this.updateAnchorPoint();
            }));
        }
        else
        {
            this.fullscreenChangedId = Main.layoutManager.connect('primary-fullscreen-changed', Lang.bind(this, function()
            {
                this.updateAnchorPoint();
            }));
        }
    },

    updateAnchorPoint: function(h)
    {
        if (this.bottomPanelActor.visible)
        {
            this.bottomPanelActor.hide();
            Main.messageTray.actor.set_anchor_point(0, 0);
            if (ShellVersion[1] !== 4)            
                Main.messageTray._notificationWidget.set_anchor_point(0, 0);
        }
        else
        {
            this.bottomPanelActor.show();
            Main.messageTray.actor.set_anchor_point(0, h);
            if (ShellVersion[1] !== 4)
                Main.messageTray._notificationWidget.set_anchor_point(0, h);
            this.onParamChanged();
        }
    },

    //Click Events
    onClickShowAppsButton: function(button, pspec)
    {
        let numButton = pspec.get_button();
        this.leftbutton = LEFTBUTTON;
        this.rightbutton = RIGHTBUTTON;
        if (this.settings.get_enum("showapps-button-toggle") == 1)
        {
            this.leftbutton = RIGHTBUTTON;
            this.rightbutton = LEFTBUTTON;
        }
        if (ShellVersion[1] === 4)
        {
            if (numButton == this.leftbutton) //Left Button
            {
                if (! Main.overview.visible)
                    Main.overview.show();
                if (Main.overview._viewSelector._activeTab.id != 'applications')
                    Main.overview._viewSelector.switchTab('applications');
                else
                    Main.overview.hide();
            }
            else if (numButton == this.rightbutton) //Right Button
            {
                if (! Main.overview.visible)
                    Main.overview.show();
                else if (Main.overview._viewSelector._activeTab.id == 'applications')
                    Main.overview._viewSelector.switchTab('windows');
                else
                    Main.overview.hide();
            }
        }
        else if (ShellVersion[1] === 10)
        {
            if (numButton == this.leftbutton) //Left Button
            {
                if (! Main.overview.visible)
                    Main.overview.show();
                if (! Main.overview.viewSelector._showAppsButton.checked)
                    Main.overview.viewSelector._showAppsButton.checked = true;
                else
                    Main.overview.hide();
            }
            else if (numButton == this.rightbutton) //Right Button
            {
                if (! Main.overview.visible)
                    Main.overview.show();
                else if (Main.overview.viewSelector._showAppsButton.checked)
                    Main.overview.viewSelector._showAppsButton.checked = false;
                else
                    Main.overview.hide();
            }
        }
        else
        {
            if (numButton == this.leftbutton) //Left Button
            {
                if (! Main.overview.visible)
                    Main.overview.show();
                if (! Main.overview._viewSelector._showAppsButton.checked)
                    Main.overview._viewSelector._showAppsButton.checked = true;
                else
                    Main.overview.hide();
            }
            else if (numButton == this.rightbutton) //Right Button
            {
                if (! Main.overview.visible)
                    Main.overview.show();
                else if (Main.overview._viewSelector._showAppsButton.checked)
                    Main.overview._viewSelector._showAppsButton.checked = false;
                else
                    Main.overview.hide();
            }
        }
    },

    onClickWorkspaceButton: function(button, pspec)
    {
        let numButton = pspec.get_button();
        if (numButton == LEFTBUTTON) //Left Button
        {
            if (this.activeWorkspaceIndex == this.totalWorkspace)
                this.activeWorkspaceIndex = -1;
            let newActiveWorkspace = global.screen.get_workspace_by_index(this.activeWorkspaceIndex + 1);
            newActiveWorkspace.activate(global.get_current_time());
        }
        else if (numButton == RIGHTBUTTON) //Right Button
        {
            if (this.activeWorkspaceIndex == 0)
                this.activeWorkspaceIndex = this.totalWorkspace + 1;
            let newActiveWorkspace = global.screen.get_workspace_by_index(this.activeWorkspaceIndex - 1);
            newActiveWorkspace.activate(global.get_current_time());
        }
    },

    onClickDesktopButton: function(button, pspec)
    {
        this.activeTasks();
        let numButton = pspec.get_button();
        if (numButton == LEFTBUTTON) //Left Button
        {
            this.tasksList.forEach(
                function(task)
                {
                    let [windowTask, buttonTask, signalsTask] = task;
                    if (this.desktopView && (! Main.overview.visible))
                        windowTask.unminimize(global.get_current_time());
                    else
                        windowTask.minimize(global.get_current_time());
                },
                this
            );
            this.desktopView = ! this.desktopView;
            if (Main.overview.visible)
                Main.overview.hide();
        }
        else if ((numButton == RIGHTBUTTON) && (this.settings.get_boolean("desktop-button-right-click"))) //Right Button
            Main.Util.trySpawnCommandLine('gnome-shell-extension-prefs ' + Extension.metadata.uuid);
    },

    onClickTaskButton: function(button, pspec, window)
    {
        let activeWorkspace = global.screen.get_active_workspace();
        let numButton = pspec.get_button();
        if ((numButton == LEFTBUTTON) && (! this.settings.get_boolean("hover-switch-task"))) //Left Button (Hover deactivated)
        {
            this.tasksList.forEach(
                function(task)
                {
                    let [windowTask, buttonTask, signalsTask] = task;
                    let windowWorkspace = windowTask.get_workspace();
                    if (windowTask == window)
                    {
                        if (windowWorkspace !== activeWorkspace)
                        {
                            windowWorkspace.activate(global.get_current_time());
                            windowTask.activate(global.get_current_time());
                        }
                        else if (! windowTask.has_focus())
                            windowTask.activate(global.get_current_time());
                        else if (! Main.overview.visible)
                            windowTask.minimize(global.get_current_time());
                    }
                },
                this
            );
            if (Main.overview.visible)
                Main.overview.hide();
        }
        else if (numButton == MIDDLEBUTTON && this.settings.get_enum("close-button") == 1) //Middle Button
            window.delete(global.get_current_time());
        else if (numButton == RIGHTBUTTON && this.settings.get_enum("close-button") == 2) //Right Button
            window.delete(global.get_current_time());
    },

    //Scroll Events
    onScrollWorkspaceButton: function(button, event)
    {
        if (this.settings.get_boolean("scroll-workspaces"))
        {
            let scrollDirection = event.get_scroll_direction();
            if (scrollDirection == Clutter.ScrollDirection.UP)
            {
            if (this.activeWorkspaceIndex == this.totalWorkspace)
                this.activeWorkspaceIndex = -1;
            let newActiveWorkspace = global.screen.get_workspace_by_index(this.activeWorkspaceIndex + 1);
            newActiveWorkspace.activate(global.get_current_time());
            }
            if (scrollDirection == Clutter.ScrollDirection.DOWN)
            {
                if (this.activeWorkspaceIndex == 0)
                    this.activeWorkspaceIndex = this.totalWorkspace + 1;
                let newActiveWorkspace = global.screen.get_workspace_by_index(this.activeWorkspaceIndex - 1);
                newActiveWorkspace.activate(global.get_current_time());
            }
        }
    },

    onScrollTaskButton: function(button, event)
    {
        if (this.settings.get_boolean("scroll-tasks"))
        {
            this.nextTask = false;
            this.previousTask = null;
            let focusWindow = global.display.focus_window;
            let activeWorkspace = global.screen.get_active_workspace();
            let scrollDirection = event.get_scroll_direction();
            if (scrollDirection == Clutter.ScrollDirection.UP)
            {
                this.tasksList.forEach(
                    function(task)
                    {
                        let [windowTask, buttonTask, signalsTask] = task;
                        let windowWorkspace = windowTask.get_workspace();
                        if (this.nextTask)
                        {
                            if (windowWorkspace !== activeWorkspace)
                                windowWorkspace.activate(global.get_current_time());
                            windowTask.activate(global.get_current_time());
                            this.nextTask = false;
                        }
                        if (windowTask === focusWindow)
                            this.nextTask = true;
                    },
                    this
                );
                if (Main.overview.visible)
                    Main.overview.hide();
            }
            else if (scrollDirection == Clutter.ScrollDirection.DOWN)
            {
                this.tasksList.forEach(
                    function(task)
                    {
                        let [windowTask, buttonTask, signalsTask] = task;
                        if ((windowTask == focusWindow) && (this.previousTask !== null))
                        {
                            let [windowTask, buttonTask, signalsTask] = this.previousTask;
                            let windowWorkspace = windowTask.get_workspace();
                            if (windowWorkspace !== activeWorkspace)
                                windowWorkspace.activate(global.get_current_time());
                            windowTask.activate(global.get_current_time());
                        }
                        this.previousTask = task;
                    },
                    this
                );
                if (Main.overview.visible)
                    Main.overview.hide();
            }
        }
    },

    //Switch Task on Hover
    onHoverSwitchTask: function(button, window)
    {
        if (! this.resetHover)
        {
            let activeWorkspace = global.screen.get_active_workspace();
            this.tasksList.forEach(
                function(task)
                {
                    let [windowTask, buttonTask, signalsTask] = task;
                    let windowWorkspace = windowTask.get_workspace();
                    if (windowTask == window)
                    {
                        if (windowWorkspace !== activeWorkspace)
                        {
                            windowWorkspace.activate(global.get_current_time());
                            windowTask.activate(global.get_current_time());
                        }
                        else if (! windowTask.has_focus())
                            windowTask.activate(global.get_current_time());
                    }
                },
                this
            );
            if (Main.overview.visible)
            Main.overview.hide();
        }
        Mainloop.source_remove(this.previewTimer2);
        this.previewTimer2 = null;
    },

    //Taskslist
    onWindowsListChanged: function(windowsList, type, window)
    {
        if (type == 0) //Add all windows (On init or workspace change)
        {
            this.cleanTasksList();
            windowsList.forEach(
                function(window)
                {
                    this.addTaskInList(window);
                },
                this
            );
            this.hidePreview();
        }
        else if (type == 1) //Add window
        {
            this.addTaskInList(window);
        }
        else if (type == 2) //Remove window
        {
            this.removeTaskInList(window);
            this.hidePreview();
        }
    },

    //Active Tasks
    activeTasks: function(window)
    {
        let active = false;
        let activeWorkspace = global.screen.get_active_workspace();
        this.tasksList.forEach(
            function(task)
            {
                let [windowTask, buttonTask, signalsTask] = task;
                let workspaceTask = windowTask.get_workspace();
                if ((! windowTask.minimized) && (workspaceTask == activeWorkspace))
                    active = true;
            },
            this
        );
        if (active == true)
            this.desktopView = false;
        else
            this.desktopView = true;
    },

    //Task Style
    onWindowChanged: function(window, type)
    {
        if(this.settings.get_boolean("text-buttons")){
            this.tasksList.forEach(
                function(task)
                {
                    let [windowTask, buttonTask, signalsTask] = task;
                    if (windowTask == window)
                    {
                        let label=buttonTask.get_child().get_children()[1];
                        label.set_text(window.get_title());                        
                    }
                },
                this
            );
        }
        if (type == 0) //Focus
        {
            this.tasksList.forEach(
                function(task)
                {
                    let [windowTask, buttonTask, signalsTask] = task;
                    if (windowTask == window)
                    {
                        buttonTask.add_style_pseudo_class(this.activeTask);
                        buttonTask.set_style(this.backgroundStyleColor);
                    }
                    else
                    {
                        buttonTask.remove_style_pseudo_class(this.activeTask);
                        buttonTask.set_style("None");
                    }
                },
                this
            );
        }
        if (type == 2) //Minimized
        {
            this.tasksList.forEach(
                function(task)
                {
                    let [windowTask, buttonTask, signalsTask] = task;
                    if (windowTask == window)
                    {
                        buttonTask.remove_style_pseudo_class(this.activeTask);
                        buttonTask.set_style("None");
                    }
                },
                this
            );
        }
    },

    //Task Index
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

    //Add Tasks
    addTaskInList: function(window)
    {
        let app = Shell.WindowTracker.get_default().get_window_app(window);
        let bchild;
        if(this.settings.get_boolean("text-buttons")){
            bchild = new St.BoxLayout({ style_class: "tkb-task-button-box"});
            let labelTask = new St.Label({ text: (window.get_title()+""), style_class: 'tkb-task-button-label' });
            let iconTask = app.create_icon_texture(this.iconSize);
            bchild.add_actor(iconTask);
            bchild.add_actor(labelTask);
        }
        else{
             bchild = app.create_icon_texture(this.iconSize);
        }
    
        let buttonTask = new St.Button({ style_class: "tkb-task-button", child: bchild });
        let signalsTask = [            
            buttonTask.connect("button-press-event", Lang.bind(this, this.onClickTaskButton, window)),  
            buttonTask.connect("scroll-event", Lang.bind(this, this.onScrollTaskButton)),          
            buttonTask.connect("enter-event", Lang.bind(this, this.showPreview, window)),
            buttonTask.connect("leave-event", Lang.bind(this, this.resetPreview, window))
        ];
        //Display tasks of All Workspaces
        if (! this.settings.get_boolean("tasks-all-workspaces"))
        {
            let workspace = global.screen.get_active_workspace();
            if ((ShellVersion[1] !== 4) && (ShellVersion[1] !== 6) && (! this.settings.get_boolean("tasks-all-workspaces")))
                buttonTask.visible = window.located_on_workspace(workspace);
        }
        if (window.has_focus())
        {
            buttonTask.add_style_pseudo_class(this.activeTask);
            buttonTask.set_style(this.backgroundStyleColor);
        }
        if (this.settings.get_boolean("display-tasks"))
            this.boxMainTasks.add_actor(buttonTask);
        this.tasksList.push([ window, buttonTask, signalsTask ]);
    },

    //Remove Tasks
    removeTaskInList: function(window)
    {
        let index = this.searchTaskInList(window);
        if (index != null)
        {
            let [windowTask, buttonTask, signalsTask] = this.tasksList[index];
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

    //Reset Taskslist
    cleanTasksList: function()
    {
        for (let i = this.tasksList.length - 1; i >= 0; i--)
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

    //Preview
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
        //Switch Task on Hover
        this.resetHover = false;
        if (this.settings.get_boolean("hover-switch-task"))
        {
            if (this.settings.get_int("hover-delay") == 0)
                this.onHoverSwitchTask(button, window);
            else
                this.previewTimer2 = Mainloop.timeout_add(this.settings.get_int("hover-delay"),
                    Lang.bind(this, this.onHoverSwitchTask, button, window));
        }
        //Hide current preview if necessary
        this.hidePreview();
        if ((this.settings.get_boolean("display-label")) || (this.settings.get_boolean("display-thumbnail")))
        {
            if (this.settings.get_int("preview-delay") == 0)
                this.showPreview2(button, window);
            else
                this.previewTimer = Mainloop.timeout_add(this.settings.get_int("preview-delay"),
                    Lang.bind(this, this.showPreview2, button, window));
        }
        this.tasksList.forEach(
            function(task)
            {
                let [windowTask, buttonTask, signalsTask] = task;
              if(windowTask==window) {
               buttonTask.add_style_pseudo_class("hover");
           }
            },
            this
        );
    },

    showPreview2: function(button, window)
    {
        //Hide current preview if necessary
        this.hidePreview();
        let app = Shell.WindowTracker.get_default().get_window_app(window);
        this.preview = new St.BoxLayout({ style_class: "tkb-preview", vertical: true});
        if (this.settings.get_boolean("display-label"))
        {
            let labelNamePreview = new St.Label({ text: app.get_name(), style_class: "tkb-preview-name" });
            this.preview.add_actor(labelNamePreview);
            let title = window.get_title();
            if ((title.length > 50) && (this.settings.get_boolean("display-thumbnail")))
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
        this.button = button;
        this.setPreviewPosition();
        this.tasksList.forEach(
            function(task)
            {
                let [windowTask, buttonTask, signalsTask] = task;
                if(windowTask==window) {
                    buttonTask.add_style_pseudo_class("hover");
                }
            },
            this
        );
    },

    showFavoritesPreview: function(buttonfavorite, favoriteapp)
    {
        //Hide current preview if necessary
        this.hidePreview();
        this.favoritesPreview = new St.BoxLayout({ style_class: "tkb-preview", vertical: true});
        let favoriteappName = favoriteapp.get_name();
        if (favoriteapp.get_description())
        {
            favoriteappName += '\n' + favoriteapp.get_description();
        }
        let labelNamePreview = new St.Label({ text: favoriteappName, style_class: "tkb-preview-name" });
        this.favoritesPreview.add_actor(labelNamePreview);
        global.stage.add_actor(this.favoritesPreview);
        this.button = buttonfavorite;
        this.preview = this.favoritesPreview;
        this.setPreviewPosition();
    },

    setPreviewPosition: function()
    {
        let [stageX, stageY] = this.button.get_transformed_position();
        let itemHeight = this.button.allocation.y2 - this.button.allocation.y1;
        let itemWidth = this.button.allocation.x2 - this.button.allocation.x1;
        let labelWidth = this.preview.get_width();
        let labelHeight = this.preview.get_height();
        let node = this.preview.get_theme_node();
        let yOffset = node.get_length('-y-offset');
        let y = null;
        if (this.settings.get_boolean("bottom-panel"))
            y = stageY - labelHeight - yOffset;
        else
            y = stageY + itemHeight + yOffset;
        let x = Math.floor(stageX + itemWidth/2 - labelWidth/2);
        let parent = this.preview.get_parent();
        let parentWidth = parent.allocation.x2 - parent.allocation.x1;
        if ( Clutter.get_default_text_direction() == Clutter.TextDirection.LTR )
        {
            x = Math.min(x, parentWidth - labelWidth - 6);
            x = Math.max(x, 6);
        }
        else
        {
            x = Math.max(x, 6);
            x = Math.min(x, parentWidth - labelWidth - 6);
        }
        this.preview.set_position(x, y);
    },

    resetPreview: function(button, window)
    {
        //Reset Hover
        this.resetHover = true;
        Mainloop.source_remove(this.previewTimer2);
        this.previewTimer2 = null;
        this.hidePreview();
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

        //Destroy Favorites Preview if displaying
        if (this.favoritesPreview != null)
        {
            this.favoritesPreview.destroy();
            this.favoritesPreview = null;
        }
         this.tasksList.forEach(
            function(task)
            {
               let [windowTask, buttonTask, signalsTask] = task;
               buttonTask.remove_style_pseudo_class("hover");
            },
            this
        );
    }
}
