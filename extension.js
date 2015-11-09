//  GNOME Shell Extension TaskBar
//  Copyright (C) 2015 zpydr
//
//  Version 47
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
//  zpydr@openmailbox.org

const Clutter = imports.gi.Clutter;
const Gdk = imports.gi.Gdk;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Shell = imports.gi.Shell;
const St = imports.gi.St;

const AppFavorites = imports.ui.appFavorites;
const Layout = imports.ui.layout;
const Main = imports.ui.main;
const MessageTray = imports.ui.messageTray;
const Panel = imports.ui.main.panel;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const RemoteMenu = imports.ui.remoteMenu;

const Extension = imports.misc.extensionUtils.getCurrentExtension();
const Lib = Extension.imports.lib;
const Prefs = Extension.imports.prefs;
const ShellVersion = imports.misc.config.PACKAGE_VERSION.split(".").map(function (x) { return + x; });
const Windows = Extension.imports.windows;
const Windows34 = Extension.imports.windows34;

const schema = "org.gnome.shell.extensions.TaskBar";

const RESETBOTTOMPANELCOLOR = 'rgba(0,0,0,1)';

const LEFTBUTTON = 1;
const MIDDLEBUTTON = 2;
const RIGHTBUTTON = 3;
const NOHOTCORNER = 54321;
const DESKTOPICON = Extension.path + '/images/desktop-button-default.png';
const APPVIEWICON = Extension.path + '/images/appview-button-default.svg';
const BPTRAYICON = Extension.path + '/images/bottom-panel-tray-button.svg';

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
    active: null,
    activeTask: null,
    activeWorkspaceIndex: null,
    activeWorkspace: null,
    activitiesContainer: null,
    appearance: null,
    appearances: [],
    appMenuContainer: null,
    app: null,
    backgroundColor: null,
    backgroundStyleColor: null,
    barriers: null,
    bottomPanelActor: null,
    bottomPanelBackgroundColor: null,
    bottomPanelBackgroundStyle: null,
    bottomPanelEndIndicator: null,
    bottomPanelHeight: null,
    bottomPanelVertical: null,
    boxBottomPanelOppositeTrayButton: null,
    boxBottomPanelTrayButton: null,
    boxDesktop: null,
    boxMainDesktopButton: null,
    boxMainFavorites: null,
    boxMain: null,
    boxMainShowAppsButton: null,
    boxMainTasksId: null,
    boxMainTasks: null,
    boxMainWorkspaceButton: null,
    boxShowApps: null,
    boxTray: null,
    boxWorkspace: null,
    buttonDesktop: null,
    buttonfavorite: null,
    button: null,
    buttonShowApps: null,
    buttonTask: null,
    buttonTray: null,
    buttonWorkspace: null,
    changedId: null,
    children: null,
    countTasks: null,
    dateMenuContainer: null,
    desktopButtonIcon: null,
    desktopView: null,
    favoriteappName: null,
    favoriteapp: null,
    favorites: null,
    favoritesPreview: null,
    focusWindow: null,
    globalThemeChangedId: null,
    height: null,
    hidingId2: null,
    hidingId: null,
    hoverComponent: null,
    hoverStyle: null,
    iconDesktop: null,
    iconPath: null,
    iconShowApps: null,
    iconSize: null,
    iconThemeChangedId: null,
    iconTray: null,
    index: null,
    indicatorCount: null,
    installedChangedId: null,
    i: null,
    itemHeight: null,
    itemWidth: null,
    labelHeight: null,
    labelNamePreview: null,
    labelTitlePreview: null,
    labelTotalWorkspace: null,
    labelTray: null,
    labelWidth: null,
    labelWorkspaceIndex: null,
    labelWorkspace: null,
    lastFocusedWindow: null,
    lastFocusedWindowUserTime: null,
    leftbutton: null,
    mainBox: null,
    maxWindows: null,
    menuQuit: null,
    messageTrayCountAddedId: null,
    messageTrayCountRemovedId: null,
    messageTrayHidingId: null,
    messageTrayShowingId: null,
    monitorChangedId: null,
    mutterWindow: null,
    newActiveWorkspace: null,
    newBox: null,
    newShowTray: null,
    newTasksContainerWidth: null,
    nextTask: null,
    node: null,
    numButton: null,
    nWorkspacesId: null,
    originalLeftPanelCornerStyle: null,
    originalRightPanelCornerStyle: null,
    originalTopPanelStyle: null,
    overviewHidingId: null,
    overviewShowingId: null,
    panelBox: null,
    panelIconSize: null,
    panelPosition: null,
    panelSize: null,
    panelStyleChangedId: null,
    parent: null,
    parentWidth: null,
    positionAppearance: null,
    positionBoxBottomEnd: null,
    positionBoxBottomMiddle: null,
    positionBoxBottomSettings: null,
    positionBoxBottomStart: null,
    positionMaxRight: null,
    preview: null,
    previewTimer2: null,
    previewTimer: null,
    previousTask: null,
    primary: null,
    resetHover: null,
    rightbutton: null,
    scale: null,
    scrollDirection: null,
    separatorAppview: null,
    separatorBoxMain: null,
    separatorDesktop: null,
    separatorFavorites: null,
    separatorLeftAppview: null,
    separatorLeftBoxMain: null,
    separatorLeftDesktop: null,
    separatorLeftFavorites: null,
    separatorLeftTasks: null,
    separatorLeftWorkspaces: null,
    separatorRightAppview: null,
    separatorRightBoxMain: null,
    separatorRightDesktop: null,
    separatorRightFavorites: null,
    separatorRightTasks: null,
    separatorRightWorkspaces: null,
    separatorTasks: null,
    separatorWorkspaces: null,
    settingSignals: [],
    settings: null,
    showAppsIcon: null,
    showTray: null,
    signalDesktop: null,
    signalShowApps: null,
    signalsTask: [],
    signalTray: null,
    stageX: null,
    stageY: null,
    systemMenuContainer: null,
    taskMenu: null,
    taskMenuIsOpen: null,
    taskMenuManager: null,
    taskMenuUp: null,
    tasksContainerWidth: null,
    tasksList: [],
    threshold: null,
    thumbnail: null,
    title: null,
    toggleOverview: null,
    topPanelBackgroundColor: null,
    topPanelBackgroundStyle: null,
    topPanelOriginalBackgroundColor: null,
    totalWorkspace: null,
    tpobc: null,
    trayIcon: null,
    type: null,
    userTime: null,
    variant: null,
    width: null,
    windows: null,
    windowsList: [],
    windowTask: null,
    windowTexture: null,
    windowWorkspace: null,
    workspace: null,
    workspaceSwitchedId: null,
    workspaceTask: null,
    x: null,
    xsettings: null,
    y: null,
    yOffset: null,

    init: function(extensionMeta, schema)
    {
        this.extensionMeta = extensionMeta;
        this.schema = schema;
    },

    onParamChanged: function()
    {
        if (! this.settings.get_boolean("reset-flag"))
        {
            this.disable();
            this.enable();
        }
    },

    enable: function()
    {
        let settings = new Lib.Settings(this.schema);
        this.settings = settings.getSettings();

        //Top Panel Background Color
        this.iconSize = this.settings.get_int('icon-size');
        this.changeTopPanelBackgroundColor();

        //First Start
        this.firstStart();

        //Add TaskBar
        this.boxMain = new St.BoxLayout({ style_class: "tkb-box" });
        this.boxMainFavorites = new St.BoxLayout({ style_class: "tkb-box" });
        this.boxMainShowAppsButton = new St.BoxLayout({ style_class: "tkb-box" });
        this.boxMainWorkspaceButton = new St.BoxLayout({ style_class: "tkb-box" });
        this.boxMainDesktopButton = new St.BoxLayout({ style_class: "tkb-box" });
        this.boxMainTasks = new St.BoxLayout({ style_class: "tkb-box", reactive: true });
        this.tasksContainerWidth = this.settings.get_int('tasks-container-width');
        if (this.tasksContainerWidth === 0)
            this.newTasksContainerWidth = -1;
        else
            this.newTasksContainerWidth = (this.tasksContainerWidth * (this.iconSize + 8));
        this.boxMainTasks.set_width(this.newTasksContainerWidth);
        this.boxMainTasksId = this.boxMainTasks.connect("scroll-event", Lang.bind(this, this.onScrollTaskButton));
        this.boxBottomPanelTrayButton = new St.BoxLayout({ style_class: "tkb-box" });
        this.boxBottomPanelOppositeTrayButton = new St.BoxLayout({ style_class: "tkb-box" });

        //Add Separators
        this.addSeparators();

        //Set TaskBar Position
        this.onPositionChanged();

        //Add Favorites
        this.addFavorites();

        //Add Appview Button
        this.addShowAppsButton();

        //Add Workspace Button
        this.addWorkspaceButton();

        //Add Desktop Button
        this.addDesktopButton();

        //Add Tray Button
        if ((ShellVersion[1] !== 16) && (ShellVersion[1] !== 18))
            this.addTrayButton();

        //Activities Button
        this.initDisplayActivitiesButton();

        //Hot Corner
        if ((ShellVersion[1] === 8) || (ShellVersion[1] === 10) || (ShellVersion[1] === 12) || (ShellVersion[1] === 14) || (ShellVersion[1] === 16) || (ShellVersion[1] === 18))
        {
            //Extended Barriers Support
            this.barriers = global.display.supports_extended_barriers();

            this.threshold = Main.layoutManager.hotCorners[Main.layoutManager.primaryIndex]._pressureBarrier._threshold;
            this.toggleOverview = Main.layoutManager.hotCorners[Main.layoutManager.primaryIndex]._toggleOverview;
        }
        this.initEnableHotCorner();

        //Application Menu
        this.initDisplayApplicationMenu();

        //Date Menu
        this.initDisplayDateMenu();

        //System Menu
        this.initDisplaySystemMenu();

        //Active Task Frame / Background Color
        this.activeTaskFrame();

        //Task Menu
        this.taskMenu = null;
        this.taskMenuUp = false;        

        //Init Windows Manage Callbacks
        if (((ShellVersion[1] === 4) || (ShellVersion[1] === 6)) && (! this.settings.get_boolean("tasks-all-workspaces")))
            this.windows = new Windows34.Windows(this, this.onWindowsListChanged, this.onWindowChanged);
        else
            this.windows = new Windows.Windows(this, this.onWindowsListChanged, this.onWindowChanged);

        //Order of Appearance
        this.appearanceOrder();

        //Preferences Hover Event
        this.hoverEvent();

        //Reinit Extension on Param Change
        this.setSignals();
        this.setSystemSignals();
    },

    disable: function()
    {
        //Disconnect Overview Signals
        if (this.overviewHidingId !== null)
        {
            Main.overview.disconnect(this.overviewHidingId);
            this.overviewHidingId = null;
        }
        if (this.overviewShowingId !== null)
        {
            Main.overview.disconnect(this.overviewShowingId);
            this.overviewShowingId = null;
        }

        //Show Activities if hidden
        if (! this.settings.get_boolean("activities-button"))
            this.activitiesContainer.show();

        //Enable Hot Corner if disabled
        if (! this.settings.get_boolean("hot-corner"))
        {
            if (ShellVersion[1] === 4)
                Main.panel._activitiesButton._hotCorner._corner.show();
            else if (ShellVersion[1] === 6)
                Main.panel.statusArea.activities.hotCorner._corner.show();
            else if ((ShellVersion[1] === 8) || (ShellVersion[1] === 10) || (ShellVersion[1] === 12) || (ShellVersion[1] === 14) || (ShellVersion[1] === 16) || (ShellVersion[1] === 18))
            {
                if (this.barriers)
                    Main.layoutManager.hotCorners[Main.layoutManager.primaryIndex]._pressureBarrier._threshold = this.threshold;
                else
                    Main.layoutManager.hotCorners[Main.layoutManager.primaryIndex]._toggleOverview = this.toggleOverview;
            }
        }

        //Show and disconnect Application Menu if hidden
        if (! this.settings.get_boolean("application-menu"))
        {
            this.appMenuContainer.show();
            if ((ShellVersion[1] === 10) || (ShellVersion[1] === 12) || (ShellVersion[1] === 14) || (ShellVersion[1] === 16) || (ShellVersion[1] === 18))
                Shell.WindowTracker.get_default().disconnect(this.hidingId2);
            Main.overview.disconnect(this.hidingId);
        }

        //Show Date Menu if hidden
        if (! this.settings.get_boolean("date-menu"))
            this.dateMenuContainer.show();

        //Show System Menu if hidden
        if (! this.settings.get_boolean("system-menu"))
            this.systemMenuContainer.show();

        //Disconnect Workspace Signals
        if (this.workspaceSwitchedId !== null)
        {
            global.screen.disconnect(this.workspaceSwitchedId);
            this.workspaceSwitchedId = null;
        }
        if (this.nWorkspacesId !== null)
        {
            global.screen.disconnect(this.nWorkspacesId);
            this.nWorkspacesId = null;
        }

        //Disconnect Favorites Signals
        if (this.installedChangedId !== null)
        {
            Shell.AppSystem.get_default().disconnect(this.installedChangedId);
            this.installedChangedId = null;
        }
        if (this.changedId !== null)
        {
            AppFavorites.getAppFavorites().disconnect(this.changedId);
            this.changedId = null;
        }

        //Disconnect Message Tray Sources Added Signal
        if (this.messageTrayCountAddedId !== null)
        {
            if ((ShellVersion[1] === 4) || (ShellVersion[1] === 6))
                Main.messageTray._summary.disconnect(this.messageTrayCountAddedId);
            else if ((ShellVersion[1] !== 16) && (ShellVersion[1] !== 18))
                Main.messageTray.disconnect(this.messageTrayCountAddedId);
            this.messageTrayCountAddedId = null;
        }

        //Disconnect Message Tray Sources Removed Signal
        if (this.messageTrayCountRemovedId !== null)
        {
            if ((ShellVersion[1] === 4) || (ShellVersion[1] === 6))
                Main.messageTray._summary.disconnect(this.messageTrayCountRemovedId);
            else if ((ShellVersion[1] !== 16) && (ShellVersion[1] !== 18))
                Main.messageTray.disconnect(this.messageTrayCountRemovedId);
            this.messageTrayCountRemovedId = null;
        }

        //Disconnect Message Tray Showing Signal
        if (this.messageTrayShowingId !== null)
        {
            if ((ShellVersion[1] !== 16) && (ShellVersion[1] !== 18))
                Main.messageTray.disconnect(this.messageTrayShowingId);
            this.messageTrayShowingId = null;
        }

        //Disconnect Message Tray Hiding Signal
        if (this.messageTrayHidingId !== null)
        {
            if ((ShellVersion[1] !== 16) && (ShellVersion[1] !== 18))
                Main.messageTray.disconnect(this.messageTrayHidingId);
            this.messageTrayHidingId = null;
        }

        //Reset Message Tray
        if (this.showTray !== null)
        {
            if ((ShellVersion[1] !== 16) && (ShellVersion[1] !== 18))
                MessageTray.MessageTray.prototype._showTray = this.showTray;
            if (ShellVersion[1] === 4)
            {
                Main.layoutManager.removeChrome(Main.layoutManager.trayBox);
                Main.layoutManager.addChrome(Main.layoutManager.trayBox, { visibleInFullscreen: true });
            }
            this.showTray = null;
        }

        //Disconnect Setting Signals
        if (this.settingSignals !== null)
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

        //Disconnect Monitor Change Signals
        if (this.monitorChangedId !== null)
        {
            Main.layoutManager.disconnect(this.monitorChangedId);
            this.monitorChangedId = null;
        }

        //Disconnect Texture Cache Signals
        if (this.iconThemeChangedId !== null)
        {
            St.TextureCache.get_default().disconnect(this.iconThemeChangedId);
            this.iconThemeChangedId = null;
        }

        //Disconnect Global Theme Signals
        if (this.globalThemeChangedId !== null)
        {
            St.ThemeContext.get_for_stage(global.stage).disconnect(this.globalThemeChangedId);
            this.globalThemeChangedId = null;
        }

        //Hide current preview if necessary
        this.hidePreview();

        //Disconnect Tasks Container Scroll Signals
        if (this.boxMainTasksId !== null)
        {
            this.boxMainTasks.disconnect(this.boxMainTasksId);
            this.boxMainTasksId = null;
        }

        //Remove TaskBar
        if (this.windows !== null)
        {
            this.windows.destruct();
            this.windows = null;
        }
        if (this.bottomPanelActor !== null)
        {
            this.bottomPanelActor.destroy();
            this.bottomPanelActor = null;
        }
        if ((ShellVersion[1] !== 16) && (ShellVersion[1] !== 18))
        {
            Main.messageTray.actor.set_anchor_point(0, 0);
            if (ShellVersion[1] !== 4)
                Main.messageTray._notificationWidget.set_anchor_point(0, 0);
        }
        if (this.newBox !== null)
        {
            this.newBox.remove_child(this.boxMain);
            this.newBox = null;
        }
        if (this.boxMain !== null)
            this.boxMain = null;
        if (this.mainBox !== null)
            this.mainBox = null;
        this.cleanTasksList();
        Main.panel.actor.set_style(this.originalTopPanelStyle);
        Main.panel._leftCorner.actor.show();
        Main.panel._rightCorner.actor.show();
        Main.panel._leftCorner.actor.set_style(this.originalLeftPanelCornerStyle);
        Main.panel._rightCorner.actor.set_style(this.originalRightPanelCornerStyle);
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
            this.settings.connect("changed::overview", Lang.bind(this, this.setOverview)),
            this.settings.connect("changed::tray-button", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::tray-button-empty", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::desktop-button-icon", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::appview-button-icon", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::tray-button-icon", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::active-task-frame", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::active-task-background-color", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::active-task-background-color-set", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::top-panel-background-color", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::top-panel-background-alpha", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::bottom-panel-background-color", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::display-tasks", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-left-box-main", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-right-box-main", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-left-tasks", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-right-tasks", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-left-desktop", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-right-desktop", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-left-workspaces", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-right-workspaces", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-left-appview", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-right-appview", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-left-favorites", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::separator-right-favorites", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::activities-button", Lang.bind(this, this.displayActivities)),
            this.settings.connect("changed::hot-corner", Lang.bind(this, this.enableHotCorner)),
            this.settings.connect("changed::application-menu", Lang.bind(this, this.displayApplicationMenu)),
            this.settings.connect("changed::date-menu", Lang.bind(this, this.displayDateMenu)),
            this.settings.connect("changed::system-menu", Lang.bind(this, this.displaySystemMenu)),
            this.settings.connect("changed::position-changed", Lang.bind(this, this.appearancePositionChange)),
            this.settings.connect("changed::bottom-panel", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::bottom-panel-vertical", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::position-bottom-box", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::tasks-all-workspaces", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::tasks-container-width", Lang.bind(this, this.onParamChanged)),
            this.settings.connect("changed::hover-event", Lang.bind(this, this.hoverEvent)),
            this.settings.connect("changed::reset-all", Lang.bind(this, this.resetAll)),
            this.settings.connect("changed::reset-flag", Lang.bind(this, this.onParamChanged))
        ];
    },

    //Monitor Change, Icon and Global Theme Change
    setSystemSignals: function()
    {
        this.monitorChangedId = null;
        this.iconThemeChangedId = null;
        this.panelStyleChangedId = null;
        this.mainBox = null;
        this.overviewHidingId = null;
        this.overviewShowingId = null;
        this.monitorChangedId = Main.layoutManager.connect('monitors-changed', Lang.bind(this, this.onParamChanged));
        this.iconThemeChangedId = St.TextureCache.get_default().connect('icon-theme-changed', Lang.bind(this, this.onParamChanged));
        this.globalThemeChangedId = St.ThemeContext.get_for_stage(global.stage).connect('changed', Lang.bind(this, this.onParamChanged));
	this.setOverview();
    },

    //TaskBar in Overview Mode
    setOverview: function()
    {
        if (! this.settings.get_boolean("overview"))
        {
            this.mainBox = this.boxMain;
            this.overviewHidingId = Main.overview.connect('hiding', Lang.bind(this, this.showMainBox));
            this.overviewShowingId = Main.overview.connect('showing', Lang.bind(this, this.hideMainBox));
        }
        else
        {
            //Disconnect Overview Signals
            if (this.overviewHidingId !== null)
            {
                Main.overview.disconnect(this.overviewHidingId);
                this.overviewHidingId = null;
            }
            if (this.overviewShowingId !== null)
            {
                Main.overview.disconnect(this.overviewShowingId);
                this.overviewShowingId = null;
            }
        }
    },

    //First Start
    firstStart: function()
    {
        if ((this.settings.get_string("extension-path") === 'unset') || (this.settings.get_string("extension-path") !== Extension.path))
        {
            this.settings.set_string("extension-path", Extension.path);
            this.settings.set_string("desktop-button-icon", DESKTOPICON);
            this.settings.set_string("appview-button-icon", APPVIEWICON);
            this.settings.set_string("tray-button-icon", BPTRAYICON);
        }
        if (ShellVersion[1] === 4)
        {
            if (this.settings.get_boolean("first-start"))
            {
                Main.Util.trySpawnCommandLine('gnome-shell-extension-prefs ' + Extension.metadata.uuid);
                this.settings.set_boolean("first-start", false);
            }
        }
        if (ShellVersion[1] !== 4)
        {
            if ((this.settings.get_boolean("first-start")) && (Main.sessionMode.currentMode === 'user'))
            {
                Main.Util.trySpawnCommandLine('gnome-shell-extension-prefs ' + Extension.metadata.uuid);
                this.settings.set_boolean("first-start", false);
            }
        }
    },

    //Add Separators
    addSeparators: function()
    {
        let separatorLeftBoxMain = this.settings.get_int('separator-left-box-main');
        let separatorRightBoxMain = this.settings.get_int('separator-right-box-main');
        let separatorLeftFavorites = this.settings.get_int('separator-left-favorites');
        let separatorRightFavorites = this.settings.get_int('separator-right-favorites');
        let separatorLeftAppview = this.settings.get_int('separator-left-appview');
        let separatorRightAppview = this.settings.get_int('separator-right-appview');
        let separatorLeftWorkspaces = this.settings.get_int('separator-left-workspaces');
        let separatorRightWorkspaces = this.settings.get_int('separator-right-workspaces');
        let separatorLeftDesktop = this.settings.get_int('separator-left-desktop');
        let separatorRightDesktop = this.settings.get_int('separator-right-desktop');
        let separatorLeftTasks = this.settings.get_int('separator-left-tasks');
        let separatorRightTasks = this.settings.get_int('separator-right-tasks');

        this.separatorBoxMain = 'padding-left: ' + separatorLeftBoxMain + 'px; padding-right: ' + separatorRightBoxMain + 'px; ';
        this.separatorFavorites = 'padding-left: ' + separatorLeftFavorites + 'px; padding-right: ' + separatorRightFavorites + 'px; ';
        this.separatorAppview = 'padding-left: ' + separatorLeftAppview + 'px; padding-right: ' + separatorRightAppview + 'px; ';
        this.separatorWorkspaces = 'padding-left: ' + separatorLeftWorkspaces + 'px; padding-right: ' + separatorRightWorkspaces + 'px; ';
        this.separatorDesktop = 'padding-left: ' + separatorLeftDesktop + 'px; padding-right: ' + separatorRightDesktop + 'px; ';
        this.separatorTasks = 'padding-left: ' + separatorLeftTasks + 'px; padding-right: ' + separatorRightTasks + 'px; ';

        this.boxMain.set_style(this.separatorBoxMain);
        this.boxMainFavorites.set_style(this.separatorFavorites);
        this.boxMainShowAppsButton.set_style(this.separatorAppview);
        this.boxMainWorkspaceButton.set_style(this.separatorWorkspaces);
        this.boxMainDesktopButton.set_style(this.separatorDesktop);
        this.boxMainTasks.set_style(this.separatorTasks);
    },

    //Reset All !
    resetAll: function()
    {
        if (this.settings.get_boolean("reset-all"))
        {
            Main.Util.trySpawnCommandLine('dconf reset -f /org/gnome/shell/extensions/TaskBar/');
        }
    },

    //Align Position
    onPositionChanged: function()
    {
        this.showTray = null;
        this.messageTrayShowingId = null;
        this.messageTrayHidingId = null;
        this.bottomPanelEndIndicator = false;
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
        if (this.panelBox === 1)
            this.newBox = Main.panel._leftBox;
        else if (this.panelBox === 2)
            this.newBox = Main.panel._centerBox;
        else if (this.panelBox === 3)
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
        for (let i = 0; i <= 4; i++)
        {
            this.appearances.forEach(
                function(appearance)
                {
                    let positionAppearance = this.settings.get_int(appearance);
                    if (positionAppearance === i)
                    {
                        if (appearance === "position-tasks")
                            this.boxMain.add_actor(this.boxMainTasks);
                        else if (appearance === "position-desktop-button")
                            this.boxMain.add_actor(this.boxMainDesktopButton);
                        else if (appearance === "position-workspace-button")
                            this.boxMain.add_actor(this.boxMainWorkspaceButton);
                        else if (appearance === "position-appview-button")
                            this.boxMain.add_actor(this.boxMainShowAppsButton);
                        else if (appearance === "position-favorites")
                            this.boxMain.add_actor(this.boxMainFavorites);
                    }
                },
                this
            );
        }
        if (this.bottomPanelEndIndicator)
            this.boxMain.add_actor(this.boxBottomPanelTrayButton);
    },

    //Appearance Position changed
    appearancePositionChange: function()
    {
        if (this.settings.get_boolean("position-changed"))
        {
            this.settings.set_boolean("position-changed", false);
            this.onParamChanged();
        }
    },

    //Hide TaskBar in Overview
    showMainBox: function()
    {
        this.mainBox.show();
    },

    hideMainBox: function()
    {
        this.mainBox.hide();
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
                if (favoriteapp === null)
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
                        if (this.settings.get_int("preview-delay") === 0)
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
            if (iconPath === 'unset')
                iconPath = APPVIEWICON;
            this.showAppsIcon = Gio.icon_new_for_string(iconPath);
            this.iconShowApps = new St.Icon(
            {
                gicon: this.showAppsIcon,
                icon_size: (this.iconSize),
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
        if (this.settings.get_enum("workspace-button-index") === 1)
            this.labelWorkspace = new St.Label({ text: (labelWorkspaceIndex + "/" + labelTotalWorkspace) });
        else if (this.settings.get_enum("workspace-button-index") === 0)
            this.labelWorkspace = new St.Label({ text: (labelWorkspaceIndex+"") });
        this.labelWorkspace.style = 'font-size: ' + (this.iconSize * 2 / 3) + 'px' + ';';
        this.buttonWorkspace.set_child(this.labelWorkspace);
    },

    //Add Desktop Button
    addDesktopButton: function()
    {
        if (this.settings.get_boolean("display-desktop-button"))
        {
            let iconPath = this.settings.get_string("desktop-button-icon");
            if (iconPath === 'unset')
                iconPath = DESKTOPICON;
            this.desktopButtonIcon = Gio.icon_new_for_string(iconPath);
            let iconDesktop = new St.Icon(
            {
                gicon: this.desktopButtonIcon,
                icon_size: (this.iconSize),
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

    //Add Tray Button
    addTrayButton: function()
    {
        this.messageTrayCountAddedId = null;
        this.messageTrayCountRemovedId = null;
        if ((this.settings.get_boolean("bottom-panel")) && (this.settings.get_enum("tray-button") !== 0) && (ShellVersion[1] !== 16) && (ShellVersion[1] !== 18))
        {
            this.buttonTray = new St.Button({ style_class: "tkb-task-button" });
            this.signalTray =
            [
                this.buttonTray.connect("button-press-event", Lang.bind(this, this.onClickTrayButton)),
                this.buttonTray.connect("enter-event", Lang.bind(this, this.onHoverTrayButton))
            ];
            if ((this.settings.get_enum("tray-button") === 1) && (this.settings.get_enum("tray-button-empty") === 0))
                this.messageTrayIcon();
            else
            {
                if ((ShellVersion[1] === 4) || (ShellVersion[1] === 6))
                {
                    this.messageTrayCountAddedId = Main.messageTray._summary.connect('actor-added', Lang.bind(this, this.messageTrayCount));
                    this.messageTrayCountRemovedId = Main.messageTray._summary.connect('actor-removed', Lang.bind(this, this.messageTrayCount));
                }
                else
                {
                    this.messageTrayCountAddedId = Main.messageTray.connect('source-added', Lang.bind(this, this.messageTrayCount));
                    this.messageTrayCountRemovedId = Main.messageTray.connect('source-removed', Lang.bind(this, this.messageTrayCount));
                }
                this.messageTrayCount();
            }
        }
    },

    messageTrayCount: function()
    {
        let indicatorCount = 0;
        if ((ShellVersion[1] === 4) || (ShellVersion[1] === 6))
            indicatorCount = Main.messageTray._summary.get_children().length;
        else
            indicatorCount = Main.messageTray.getSources().length;
        if (((indicatorCount === 0) && (this.settings.get_enum("tray-button-empty") === 0)) ||
            ((indicatorCount !== 0) && (this.settings.get_enum("tray-button-empty") === 1) && (this.settings.get_enum("tray-button") !== 2)) ||
            ((indicatorCount !== 0) && (this.settings.get_enum("tray-button") === 1)))
            this.messageTrayIcon();
        else
        {
            if ((indicatorCount === 0) && (this.settings.get_enum("tray-button-empty") === 2))
                this.labelTray = new St.Label();
            else
                this.labelTray = new St.Label({ text: (indicatorCount+'') });
            this.buttonTray.set_child(this.labelTray);
            this.boxTray = new St.BoxLayout({ style_class: "tkb-desktop-box" });
            this.boxTray.add_actor(this.buttonTray);
            this.boxBottomPanelTrayButton.add_actor(this.boxTray);
        }
    },

    messageTrayIcon: function()
    {
        let iconPath = this.settings.get_string("tray-button-icon");
        if (iconPath === 'unset')
            iconPath = BPTRAYICON;
        this.trayIcon = Gio.icon_new_for_string(iconPath);
        this.iconTray = new St.Icon(
        {
            gicon: this.trayIcon,
            icon_size: (this.iconSize),
            style_class: "tkb-desktop-icon"
        });
        this.buttonTray.set_child(this.iconTray);
        this.boxTray = new St.BoxLayout({ style_class: "tkb-desktop-box" });
        this.boxTray.add_actor(this.buttonTray);
        this.boxBottomPanelTrayButton.add_actor(this.boxTray);
    },

    //Activities Button
    displayActivities: function()
    {
        this.initDisplayActivitiesButton();
        if (this.settings.get_boolean("activities-button"))
            this.activitiesContainer.show();
    },

    initDisplayActivitiesButton: function()
    {
        if (! this.settings.get_boolean("activities-button"))
        {
            if (ShellVersion[1] === 4)
                this.activitiesContainer = Main.panel._activitiesButton.container;
            else
                this.activitiesContainer = Main.panel.statusArea.activities.container;
            this.activitiesContainer.hide();
        }
    },

    //Hot Corner
    enableHotCorner: function()
    {
        this.initEnableHotCorner();
        if (this.settings.get_boolean("hot-corner"))
        {
            if ((ShellVersion[1] === 4) && (this.settings.get_boolean("activities-button")))
                    Main.panel._activitiesButton._hotCorner._corner.show();
            else if ((ShellVersion[1] === 6) && (this.settings.get_boolean("activities-button")))
                Main.panel.statusArea.activities.hotCorner._corner.show();
            else if ((ShellVersion[1] === 8) || (ShellVersion[1] === 10) || (ShellVersion[1] === 12) || (ShellVersion[1] === 14) || (ShellVersion[1] === 16) || (ShellVersion[1] === 18))
            {
                if (this.barriers)
                    Main.layoutManager.hotCorners[Main.layoutManager.primaryIndex]._pressureBarrier._threshold = this.threshold;
                else
                    Main.layoutManager.hotCorners[Main.layoutManager.primaryIndex]._toggleOverview = this.toggleOverview;
            }
        }
    },

    initEnableHotCorner: function()
    {
        if (! this.settings.get_boolean("hot-corner"))
        {
            if ((ShellVersion[1] === 4) && (this.settings.get_boolean("activities-button")))
                Main.panel._activitiesButton._hotCorner._corner.hide();
            else if ((ShellVersion[1] === 6) && (this.settings.get_boolean("activities-button")))
                Main.panel.statusArea.activities.hotCorner._corner.hide();
            else if ((ShellVersion[1] === 8) || (ShellVersion[1] === 10) || (ShellVersion[1] === 12) || (ShellVersion[1] === 14) || (ShellVersion[1] === 16) || (ShellVersion[1] === 18))
            {
                if (this.barriers)
                    Main.layoutManager.hotCorners[Main.layoutManager.primaryIndex]._pressureBarrier._threshold = NOHOTCORNER;
                else
                    Main.layoutManager.hotCorners[Main.layoutManager.primaryIndex]._toggleOverview = NOHOTCORNER;
            }
        }
    },

    //Application Menu
    displayApplicationMenu: function()
    {
        this.initDisplayApplicationMenu();
        if (this.settings.get_boolean("application-menu"))
        {
            let variant = GLib.Variant.new('a{sv}', { 'Gtk/ShellShowsAppMenu': GLib.Variant.new('i', 1) });
            let xsettings = new Gio.Settings({ schema: 'org.gnome.settings-daemon.plugins.xsettings' });
            xsettings.set_value('overrides', variant);
            this.appMenuContainer.show();
            if ((ShellVersion[1] === 10) || (ShellVersion[1] === 12) || (ShellVersion[1] === 14) || (ShellVersion[1] === 16) || (ShellVersion[1] === 18))
                Shell.WindowTracker.get_default().disconnect(this.hidingId2);
            Main.overview.disconnect(this.hidingId);
        }
    },

    initDisplayApplicationMenu: function()
    {
        if (ShellVersion[1] === 4)
        {
            if (Main.panel._appMenu !== null)
            {
                this.appMenuContainer = Main.panel._appMenu.container;
                if (! this.settings.get_boolean("application-menu"))
                {
                    let variant = GLib.Variant.new('a{sv}', { 'Gtk/ShellShowsAppMenu': GLib.Variant.new('i', 0) });
                    let xsettings = new Gio.Settings({ schema: 'org.gnome.settings-daemon.plugins.xsettings' });
                    xsettings.set_value('overrides', variant);
                    this.appMenuContainer.hide();
                    this.hidingId = Main.overview.connect('hiding', function ()
                    {
                        Main.panel._appMenu.container.hide();
                    });
                }
            }
        }
        else if ((ShellVersion[1] === 10) || (ShellVersion[1] === 12) || (ShellVersion[1] === 14) || (ShellVersion[1] === 16) || (ShellVersion[1] === 18))
        {
            this.appMenuContainer = Main.panel.statusArea.appMenu.container;
            if (! this.settings.get_boolean("application-menu"))
            {
                this.appMenuContainer.hide();
                this.hidingId = Main.overview.connect('hiding', function ()
                {
                    Main.panel.statusArea.appMenu.container.hide();
                });
                this.hidingId2 = Shell.WindowTracker.get_default().connect('notify::focus-app', function ()
                {
                    Main.panel.statusArea.appMenu.container.hide();
                });
            }
        }
        else if ((ShellVersion[1] === 6) || (ShellVersion[1] === 8))
        {
            this.appMenuContainer = Main.panel.statusArea.appMenu.container;
            if (! this.settings.get_boolean("application-menu"))
            {
                let variant = GLib.Variant.new('a{sv}', { 'Gtk/ShellShowsAppMenu': GLib.Variant.new('i', 0) });
                let xsettings = new Gio.Settings({ schema: 'org.gnome.settings-daemon.plugins.xsettings' });
                xsettings.set_value('overrides', variant);
                this.appMenuContainer.hide();
                this.hidingId = Main.overview.connect('hiding', function ()
                {
                    Main.panel.statusArea.appMenu.container.hide();
                });
            }
        }
    },

    //Date Menu
    displayDateMenu: function()
    {
        this.initDisplayDateMenu();
        if (this.settings.get_boolean("date-menu"))
            this.dateMenuContainer.show();
    },

    initDisplayDateMenu: function()
    {
        if (! this.settings.get_boolean("date-menu"))
        {
            if (ShellVersion[1] === 4)
                this.dateMenuContainer = Main.panel._dateMenuButton.container;
            else
                this.dateMenuContainer = Main.panel.statusArea.dateMenu.container;
            this.dateMenuContainer.hide();
        }
    },

    //System Menu
    displaySystemMenu: function()
    {
        this.initDisplaySystemMenu();
        if (this.settings.get_boolean("system-menu"))
            this.systemMenuContainer.show();
    },

    initDisplaySystemMenu: function()
    {
        if (! this.settings.get_boolean("system-menu"))
        {
            if (ShellVersion[1] === 4)
                this.systemMenuContainer = Main.panel._aggregateMenuButton.container;
            else
                this.systemMenuContainer = Main.panel.statusArea.aggregateMenu.container;
            this.systemMenuContainer.hide();
        }
    },

    //Preferences Hover Component Event
    hoverEvent: function()
    {
        this.hoverComponent = this.settings.get_int("hover-event");
        this.hoverStyle = "background-color: red; border-radius: 5px";
        if (this.hoverComponent === 1)
            this.boxMainTasks.set_style(this.separatorTasks + this.hoverStyle);
        else if (this.hoverComponent === 2)
            this.boxMainDesktopButton.set_style(this.separatorDesktop + this.hoverStyle);
        else if (this.hoverComponent === 3)
            this.boxMainWorkspaceButton.set_style(this.separatorWorkspaces + this.hoverStyle);
        else if (this.hoverComponent === 4)
            this.boxMainShowAppsButton.set_style(this.separatorAppview + this.hoverStyle);
        else if (this.hoverComponent === 5)
            this.boxMainFavorites.set_style(this.separatorFavorites + this.hoverStyle);
        else if (this.hoverComponent === 0)
        {
            this.boxMainTasks.set_style(this.separatorTasks);
            this.boxMainDesktopButton.set_style(this.separatorDesktop);
            this.boxMainWorkspaceButton.set_style(this.separatorWorkspaces);
            this.boxMainShowAppsButton.set_style(this.separatorAppview);
            this.boxMainFavorites.set_style(this.separatorFavorites);
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

    //Top Panel Background Color
    changeTopPanelBackgroundColor: function()
    {
        this.originalTopPanelStyle = Main.panel.actor.get_style();
        this.originalLeftPanelCornerStyle = Main.panel._leftCorner.actor.get_style();
        this.originalRightPanelCornerStyle = Main.panel._rightCorner.actor.get_style();
        this.panelIconSize = Math.round(this.iconSize * 2 / 3);
        this.panelSize = 'font-size: ' + this.panelIconSize + 'px;';
        this.topPanelBackgroundColor = this.settings.get_string("top-panel-background-color");
        if (this.topPanelBackgroundColor === 'unset')
        {
            Main.panel.actor.set_style(this.panelSize);
            //Get Native Panel Background Color
            let tpobc = Main.panel.actor.get_theme_node().get_background_color();
            let topPanelOriginalBackgroundColor = 'rgba(%d, %d, %d, %d)'.format(tpobc.red, tpobc.green, tpobc.blue, tpobc.alpha);
            this.settings.set_string("top-panel-original-background-color", topPanelOriginalBackgroundColor);
            this.bottomPanelBackgroundColor = this.settings.get_string("bottom-panel-background-color");
            if (this.bottomPanelBackgroundColor === 'unset')
            {
                this.settings.set_string("bottom-panel-original-background-color", topPanelOriginalBackgroundColor);
            }
        }
        else
        {
            this.topPanelBackgroundStyle = "background-color: " + this.topPanelBackgroundColor + ";";
            Main.panel.actor.set_style(this.panelSize + ' ' + this.topPanelBackgroundStyle);
            if (this.settings.get_boolean("top-panel-background-alpha"))
            {
                Main.panel._leftCorner.actor.hide();
                Main.panel._rightCorner.actor.hide();
            }
            else
            {
                Main.panel._leftCorner.actor.show();
                Main.panel._rightCorner.actor.show();
                Main.panel._leftCorner.actor.set_style('-panel-corner-background-color: ' + this.topPanelBackgroundColor + ';');
                Main.panel._rightCorner.actor.set_style('-panel-corner-background-color: ' + this.topPanelBackgroundColor + ';');
            }
        }
    },

    //Bottom Panel
    bottomPanel: function()
    {
        let bottomPanelHeight = null;
        let newShowTray = null;
        this.iconSize = this.settings.get_int('icon-size-bottom');
        this.panelSize = 'font-size: ' + (this.iconSize * 2 / 3) + 'px;';
        this.bottomPanelVertical = this.settings.get_int('bottom-panel-vertical');
        this.bottomPanelBackgroundColor = this.settings.get_string("bottom-panel-background-color");
        if (this.bottomPanelBackgroundColor === "unset")
            this.bottomPanelBackgroundColor = this.settings.get_string("bottom-panel-original-background-color");
        this.bottomPanelBackgroundStyle = "background-color: " + this.bottomPanelBackgroundColor + ";";
        this.bottomPanelActor = new St.BoxLayout({name: 'bottomPanel'});
        this.bottomPanelActor.set_style(this.panelSize + ' ' + this.bottomPanelBackgroundStyle);
        this.bottomPanelActor.set_reactive(false);
        if ((ShellVersion[1] === 4) || (ShellVersion[1] === 6) || (ShellVersion[1] === 8))
        {
            this.positionBoxBottomStart = new St.BoxLayout();
            this.positionBoxBottomMiddle = new St.BoxLayout();
            this.positionBoxBottomEnd = new St.BoxLayout();
        }
        else
        {
            this.positionBoxBottomStart = new St.Bin({ x_fill: false, x_expand: true, x_align: St.Align.START });
            this.positionBoxBottomMiddle = new St.Bin({ x_fill: false, x_expand: true, x_align: St.Align.MIDDLE });
            this.positionBoxBottomEnd = new St.Bin({ x_fill: false, x_expand: true, x_align: St.Align.END });
        }
        this.positionBoxBottomSettings = this.settings.get_int("position-bottom-box");
        if (this.positionBoxBottomSettings === 0)
            this.positionBoxBottomStart.add_actor(this.boxMain);
        if (this.positionBoxBottomSettings === 1)
            this.positionBoxBottomMiddle.add_actor(this.boxMain);
        if (this.positionBoxBottomSettings === 2)
        {
            this.positionBoxBottomEnd.add_actor(this.boxMain);
            this.bottomPanelEndIndicator = true;
        }
        else
            this.positionBoxBottomEnd.add_actor(this.boxBottomPanelTrayButton);
        if (ShellVersion[1] === 4)
            Main.layoutManager.addChrome(this.bottomPanelActor, { affectsStruts: true, visibleInFullscreen: false });
        else
            Main.layoutManager.addChrome(this.bottomPanelActor, { affectsStruts: true, trackFullscreen: true });
        if ((ShellVersion[1] === 4) || (ShellVersion[1] === 6) || (ShellVersion[1] === 8))
        {
            this.bottomPanelActor.add(this.positionBoxBottomStart, { x_align: St.Align.START, expand: true, x_fill: false });
            this.bottomPanelActor.add(this.positionBoxBottomMiddle, { x_align: St.Align.MIDDLE, expand: true, x_fill: false });
            this.bottomPanelActor.add(this.positionBoxBottomEnd, { x_align: St.Align.END, expand: true, x_fill: false });
        }
        else
        {
            this.bottomPanelActor.add_actor(this.positionBoxBottomStart);
            this.bottomPanelActor.add_actor(this.positionBoxBottomMiddle);
            this.bottomPanelActor.add_actor(this.positionBoxBottomEnd);
        }
        let primary = Main.layoutManager.primaryMonitor;
        this.height = (this.iconSize + this.bottomPanelVertical + 2);
        this.bottomPanelActor.set_position(primary.x, primary.y+primary.height-this.height);
        this.bottomPanelActor.set_size(primary.width, -1);
        if ((ShellVersion[1] !== 4) && (ShellVersion[1] !== 16) && (ShellVersion[1] !== 18))
            Main.messageTray._notificationWidget.set_anchor_point(0, this.height);
        if (ShellVersion[1] === 4)
        {
            Main.layoutManager.removeChrome(Main.layoutManager.trayBox);
            Main.layoutManager.addChrome(Main.layoutManager.trayBox, { visibleInFullscreen: false });
        }
        if ((ShellVersion[1] === 8) || (ShellVersion[1] === 10) || (ShellVersion[1] === 12) || (ShellVersion[1] === 14))
        {
            this.messageTrayShowingId = Main.messageTray.connect('showing', Lang.bind(this, function()
            {
                Main.messageTray.actor.set_anchor_point(0, this.height);
            }));
            this.messageTrayHidingId = Main.messageTray.connect('hiding', Lang.bind(this, function()
            {
                Main.messageTray.actor.set_anchor_point(0, 0);
            }));
        }
        else if ((ShellVersion[1] === 4) || (ShellVersion[1] === 6))
        {
            bottomPanelHeight = this.height;
            this.showTray = MessageTray.MessageTray.prototype._showTray;
            newShowTray = function()
            {
                this._tween(this.actor, '_trayState', MessageTray.State.SHOWN,
                { y: - this.actor.height - bottomPanelHeight,
                  time: MessageTray.ANIMATION_TIME,
                  transition: 'easeOutQuad'
                });
            };
            MessageTray.MessageTray.prototype._showTray = newShowTray;
        }
    },

    //Click Events
    onClickShowAppsButton: function(button, pspec)
    {
        let numButton = pspec.get_button();
        this.leftbutton = LEFTBUTTON;
        this.rightbutton = RIGHTBUTTON;
        if (this.settings.get_enum("showapps-button-toggle") === 1)
        {
            this.leftbutton = RIGHTBUTTON;
            this.rightbutton = LEFTBUTTON;
        }
        if (ShellVersion[1] === 4)
        {
            if (numButton === this.leftbutton) //Left Button
            {
                if (! Main.overview.visible)
                    Main.overview.show();
                if (Main.overview._viewSelector._activeTab.id !== 'applications')
                    Main.overview._viewSelector.switchTab('applications');
                else
                    Main.overview.hide();
            }
            else if (numButton === this.rightbutton) //Right Button
            {
                if (! Main.overview.visible)
                    Main.overview.show();
                else if (Main.overview._viewSelector._activeTab.id === 'applications')
                    Main.overview._viewSelector.switchTab('windows');
                else
                    Main.overview.hide();
            }
        }
        else if ((ShellVersion[1] === 10) || (ShellVersion[1] === 12) || (ShellVersion[1] === 14) || (ShellVersion[1] === 16) || (ShellVersion[1] === 18))
        {
            if (numButton === this.leftbutton) //Left Button
            {
                if (! Main.overview.visible)
                    Main.overview.show();
                if (! Main.overview.viewSelector._showAppsButton.checked)
                    Main.overview.viewSelector._showAppsButton.checked = true;
                else
                    Main.overview.hide();
            }
            else if (numButton === this.rightbutton) //Right Button
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
            if (numButton === this.leftbutton) //Left Button
            {
                if (! Main.overview.visible)
                    Main.overview.show();
                if (! Main.overview._viewSelector._showAppsButton.checked)
                    Main.overview._viewSelector._showAppsButton.checked = true;
                else
                    Main.overview.hide();
            }
            else if (numButton === this.rightbutton) //Right Button
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
        if (numButton === LEFTBUTTON) //Left Button
        {
            if (this.activeWorkspaceIndex === this.totalWorkspace)
                this.activeWorkspaceIndex = -1;
            let newActiveWorkspace = global.screen.get_workspace_by_index(this.activeWorkspaceIndex + 1);
            newActiveWorkspace.activate(global.get_current_time());
        }
        else if (numButton === RIGHTBUTTON) //Right Button
        {
            if (this.activeWorkspaceIndex === 0)
                this.activeWorkspaceIndex = this.totalWorkspace + 1;
            let newActiveWorkspace = global.screen.get_workspace_by_index(this.activeWorkspaceIndex - 1);
            newActiveWorkspace.activate(global.get_current_time());
        }
    },

    onClickDesktopButton: function(button, pspec)
    {
        let maxWindows = false;
        let userTime = null;
        let activeWorkspace = global.screen.get_active_workspace();
        this.activeTasks();
        let numButton = pspec.get_button();
        if (numButton === LEFTBUTTON) //Left Button
        {
            this.tasksList.forEach(
                function(task)
                {
                    let [windowTask, buttonTask, signalsTask] = task;
                    let windowWorkspace = windowTask.get_workspace();
                    if (this.desktopView && (! Main.overview.visible) && (windowWorkspace === activeWorkspace))
                    {
                        userTime = windowTask.user_time;
                        if (userTime > this.lastFocusedWindowUserTime)
                        {
                            this.lastFocusedWindowUserTime = userTime;
                            this.lastFocusedWindow = windowTask;
                        }
                        windowTask.unminimize(global.get_current_time());
                        maxWindows = true;
                    }
                    else if (windowWorkspace === activeWorkspace)
                    {
                        windowTask.minimize(global.get_current_time());
                    }
                },
                this
            );
            if (maxWindows)
            {
                this.lastFocusedWindow.activate(global.get_current_time());
            }
            this.desktopView = ! this.desktopView;
            if (Main.overview.visible)
                Main.overview.hide();
        }
        else if ((numButton === RIGHTBUTTON) && (this.settings.get_boolean("desktop-button-right-click"))) //Right Button
            Main.Util.trySpawnCommandLine('gnome-shell-extension-prefs ' + Extension.metadata.uuid);
    },

    onClickTaskButton: function(button, pspec, window)
    {
        if (this.taskMenuUp)
        {
            let taskMenuIsOpen = this.taskMenu.isOpen;
            if (taskMenuIsOpen)
            {
                this.taskMenu.close();
                return;
            }
        }
        let activeWorkspace = global.screen.get_active_workspace();
        let numButton = pspec.get_button();
        if (numButton === LEFTBUTTON) //Left Button
        {
            this.tasksList.forEach(
                function(task)
                {
                    let [windowTask, buttonTask, signalsTask] = task;
                    let windowWorkspace = windowTask.get_workspace();
                    if (windowTask === window)
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
        else if (((numButton === MIDDLEBUTTON) && (this.settings.get_enum("task-menu") === 1))
            || ((numButton === RIGHTBUTTON) && (this.settings.get_enum("task-menu") === 2))) //Middle or Right Button
        {
            this.taskMenu = null;
            let app = Shell.WindowTracker.get_default().get_window_app(window);
            let taskMenuManager = new PopupMenu.PopupMenuManager({actor: button});
            if (app.action_group && app.menu)
                this.taskMenu = new RemoteMenu.RemoteMenu(button, app.menu, app.action_group);
            else
            {
                this.taskMenu = new PopupMenu.PopupMenu(button, 0.0, St.Side.TOP);
                let menuQuit = new PopupMenu.PopupMenuItem("Quit");
                menuQuit.connect('activate', Lang.bind(this, function()
                {
                    window.delete(global.get_current_time());
                }));
                this.taskMenu.addMenuItem(menuQuit);
            }
            this.taskMenu.actor.hide();
            taskMenuManager.addMenu(this.taskMenu);
            Main.uiGroup.add_actor(this.taskMenu.actor);
            this.taskMenuUp = true;
            this.hidePreview();
            this.taskMenu.open();
        }
        else if (((numButton === MIDDLEBUTTON) && (this.settings.get_enum("close-button") === 1))
            || ((numButton === RIGHTBUTTON) && (this.settings.get_enum("close-button") === 2))) //Middle or Right Button
            window.delete(global.get_current_time());
    },

    onClickTrayButton: function(button, pspec)
    {
        let numButton = pspec.get_button();
        if (numButton === LEFTBUTTON) //Left Button
        {
            Main.messageTray.toggle();
        }
    },

    //Scroll Events
    onScrollWorkspaceButton: function(button, event)
    {
        if ((this.settings.get_enum("scroll-workspaces") === 1) || (this.settings.get_enum("scroll-workspaces") === 2))
        {
            let scrollDirection = event.get_scroll_direction();
            if (((scrollDirection === Clutter.ScrollDirection.UP) && (this.settings.get_enum("scroll-workspaces") === 1))
                || ((scrollDirection === Clutter.ScrollDirection.DOWN) && (this.settings.get_enum("scroll-workspaces") === 2)))
            {
                if (this.activeWorkspaceIndex === this.totalWorkspace)
                    this.activeWorkspaceIndex = -1;
                let newActiveWorkspace = global.screen.get_workspace_by_index(this.activeWorkspaceIndex + 1);
                newActiveWorkspace.activate(global.get_current_time());
            }
            else if (((scrollDirection === Clutter.ScrollDirection.DOWN) && (this.settings.get_enum("scroll-workspaces") === 1))
                    || ((scrollDirection === Clutter.ScrollDirection.UP) && (this.settings.get_enum("scroll-workspaces") === 2)))
            {
                if (this.activeWorkspaceIndex === 0)
                    this.activeWorkspaceIndex = this.totalWorkspace + 1;
                let newActiveWorkspace = global.screen.get_workspace_by_index(this.activeWorkspaceIndex - 1);
                newActiveWorkspace.activate(global.get_current_time());
            }
        }
    },

    onScrollTaskButton: function(button, event)
    {
        if ((this.settings.get_enum("scroll-tasks") === 1) || (this.settings.get_enum("scroll-tasks") === 2))
        {
            this.nextTask = false;
            this.previousTask = null;
            let focusWindow = global.display.focus_window;
            let activeWorkspace = global.screen.get_active_workspace();
            let scrollDirection = event.get_scroll_direction();
            if (((scrollDirection === Clutter.ScrollDirection.UP) && (this.settings.get_enum("scroll-tasks") === 1))
                || ((scrollDirection === Clutter.ScrollDirection.DOWN) && (this.settings.get_enum("scroll-tasks") === 2)))
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
            else if (((scrollDirection === Clutter.ScrollDirection.DOWN) && (this.settings.get_enum("scroll-tasks") === 1))
                    || ((scrollDirection === Clutter.ScrollDirection.UP) && (this.settings.get_enum("scroll-tasks") === 2)))
            {
                this.tasksList.forEach(
                    function(task)
                    {
                        let [windowTask, buttonTask, signalsTask] = task;
                        if ((windowTask === focusWindow) && (this.previousTask !== null))
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

    //Open Tray on Tray Button Hover
    onHoverTrayButton: function()
    {
        if (this.settings.get_boolean("hover-tray-button"))
            Main.messageTray.toggle();
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
                    if (windowTask === window)
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
        if (this.previewTimer2 !== null)
        {
            Mainloop.source_remove(this.previewTimer2);
            this.previewTimer2 = null;
        }
    },

    //Taskslist
    onWindowsListChanged: function(windowsList, type, window)
    {
        if (type === 0) //Add all windows (On init or workspace change)
        {
            this.countTasks = null;
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
        else if (type === 1) //Add window
        {
            this.addTaskInList(window);
        }
        else if (type === 2) //Remove window
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
                if ((! windowTask.minimized) && (workspaceTask === activeWorkspace))
                    active = true;
            },
            this
        );
        if (active === true)
            this.desktopView = false;
        else
            this.desktopView = true;
    },

    //Task Style
    onWindowChanged: function(window, type)
    {
        if (type === 0) //Focus
        {
            this.tasksList.forEach(
                function(task)
                {
                    let [windowTask, buttonTask, signalsTask] = task;
                    if (windowTask === window)
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
        if (type === 2) //Minimized
        {
            this.tasksList.forEach(
                function(task)
                {
                    let [windowTask, buttonTask, signalsTask] = task;
                    if (windowTask === window)
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
            if (windowTask === window)
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
        if (app)
        {
            let buttonTask = new St.Button({ style_class: "tkb-task-button", child: app.create_icon_texture(this.iconSize) });
            let signalsTask = [
                buttonTask.connect("button-press-event", Lang.bind(this, this.onClickTaskButton, window)),
                buttonTask.connect("enter-event", Lang.bind(this, this.showPreview, window)),
                buttonTask.connect("leave-event", Lang.bind(this, this.resetPreview, window))
            ];
            //Display Tasks of All Workspaces
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
            this.newTasksContainerWidth = (this.tasksContainerWidth * (this.iconSize + 8));
            this.countTasks ++;
            if (this.countTasks > this.tasksContainerWidth)
                this.boxMainTasks.set_width(-1);
            else
                this.boxMainTasks.set_width(this.newTasksContainerWidth);
            if (this.settings.get_boolean("display-tasks"))
                this.boxMainTasks.add_actor(buttonTask);
            else
                this.boxMainTasks.set_width(-1);
            this.tasksList.push([ window, buttonTask, signalsTask ]);
        }
    },

    //Remove Tasks
    removeTaskInList: function(window)
    {
        let index = this.searchTaskInList(window);
        if (index !== null)
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
            this.countTasks --;
            if (this.countTasks <= 0)
                this.countTasks = 0;
            if (this.countTasks > this.tasksContainerWidth)
                this.boxMainTasks.set_width(-1);
            else
                this.boxMainTasks.set_width(this.newTasksContainerWidth);
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
            if (this.countTasks !== null)
                this.countTasks = null;
        }
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
            if (this.settings.get_int("hover-delay") === 0)
                this.onHoverSwitchTask(button, window);
            else
                this.previewTimer2 = Mainloop.timeout_add(this.settings.get_int("hover-delay"),
                    Lang.bind(this, this.onHoverSwitchTask, button, window));
        }
        //Hide current preview if necessary
        this.hidePreview();
        if ((this.settings.get_boolean("display-label")) || (this.settings.get_boolean("display-thumbnail")))
        {
            if (this.settings.get_int("preview-delay") === 0)
                this.showPreview2(button, window);
            else
                this.previewTimer = Mainloop.timeout_add(this.settings.get_int("preview-delay"),
                    Lang.bind(this, this.showPreview2, button, window));
        }
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
        if ( Clutter.get_default_text_direction() === Clutter.TextDirection.LTR )
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
        if (this.previewTimer2 !== null)
        {
            Mainloop.source_remove(this.previewTimer2);
            this.previewTimer2 = null;
        }
        this.hidePreview();
    },

    hidePreview: function()
    {
        //Remove preview programmed if necessary
        if (this.previewTimer !== null)
        {
            Mainloop.source_remove(this.previewTimer);
            this.previewTimer = null;
        }

        //Destroy Preview if displaying
        if (this.preview !== null)
        {
            this.preview.destroy();
            this.preview = null;
        }

        //Destroy Favorites Preview if displaying
        if (this.favoritesPreview !== null)
        {
            this.favoritesPreview.destroy();
            this.favoritesPreview = null;
        }
    }
};
