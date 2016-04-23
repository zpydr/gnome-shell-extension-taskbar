//  GNOME Shell Extension TaskBar
//  Copyright (C) 2016 zpydr
//
//  Version 52
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

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Gdk = imports.gi.Gdk;
const GdkPixbuf = imports.gi.GdkPixbuf;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;

const Extension = imports.misc.extensionUtils.getCurrentExtension();
const Lib = Extension.imports.lib;

const Gettext = imports.gettext.domain('TaskBar');
const _ = Gettext.gettext;

const Config = imports.misc.config;
const ExtensionUtils = imports.misc.extensionUtils;
const ShellVersion = imports.misc.config.PACKAGE_VERSION.split(".").map(function (x) { return + x; });

const schema = "org.gnome.shell.extensions.TaskBar";

const RESETCOLOR = 'rgba(0,0,0,0)';
const RESETCOLORWHITE = 'rgba(255,255,255,1.0)';

const DESKTOPICON = Extension.path + '/images/desktop-button-default.png';
const APPVIEWICON = Extension.path + '/images/appview-button-default.svg';
const TRAYICON = Extension.path + '/images/bottom-panel-tray-button.svg';
const HOMEICON = Extension.path + '/images/settings-home.png';
const MAILICON = Extension.path + '/images/settings-mail.png';
const GNOMEICON = Extension.path + '/images/settings-gnome.png';
const FSFICON = Extension.path + '/images/settings-fsf.png';
const GPLICON = Extension.path + '/images/settings-gpl.png';
const SPACERICON = Extension.path + '/images/settings-1px.png';


function init()
{
    initTranslations("TaskBar");
}

/**
 * initTranslations:
 * @domain: (optional): the gettext domain to use
 *
 * Initialize Gettext to load translations from extensionsdir/locale.
 * If @domain is not provided, it will be taken from metadata['gettext-domain']
 */
function initTranslations(domain) {
    let extension = ExtensionUtils.getCurrentExtension();

    domain = domain || extension.metadata['gettext-domain'];

    // check if this extension was built with "make zip-file", and thus
    // has the locale files in a subfolder
    // otherwise assume that extension has been installed in the
    // same prefix as gnome-shell
    let localeDir = extension.dir.get_child('locale');
    if (localeDir.query_exists(null))
        imports.gettext.bindtextdomain(domain, localeDir.get_path());
    else
        imports.gettext.bindtextdomain(domain, Config.LOCALEDIR);
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

    buildPrefsWidget: function()
    {
        let notebook = new Gtk.Notebook();
        notebook.set_scrollable(true);
        notebook.popup_enable(true);
        notebook.set_tab_pos(0);
        this.newValueAppearance = null;
        this.oldValueAppearance = null;

        this.gridTaskBar = new Gtk.Grid();
        this.gridTaskBar.margin = this.gridTaskBar.row_spacing = 10;
        this.gridTaskBar.column_spacing = 2;

        let scrollWindowTaskBar = this.gridTaskBar;

        scrollWindowTaskBar.show_all();
        let labelTaskBar = new Gtk.Label({label: _("About")});
        notebook.append_page(scrollWindowTaskBar, labelTaskBar);

        let linkImage1 = new Gtk.Image({file: HOMEICON});
        let linkImage2 = new Gtk.Image({file: HOMEICON});
        let linkImage3 = new Gtk.Image({file: MAILICON});
        let linkImage4 = new Gtk.Image({file: MAILICON});
        let linkImage5 = new Gtk.Image({file: DESKTOPICON});
        let linkImage6 = new Gtk.Image({file: GNOMEICON});
        let linkImage7 = new Gtk.Image({file: FSFICON});
        let linkImage8 = new Gtk.Image({file: SPACERICON});

        let labelVersion1 = new Gtk.Label({label: _("Version")+" 52"});
        this.gridTaskBar.attach(labelVersion1, 0, 1, 5, 1);
        let labelVersion2 = new Gtk.Label({label: _("GNOME Shell Version")+" 3."+ShellVersion[1]});
        this.gridTaskBar.attach(labelVersion2, 0, 2, 5, 1);
        let labelLink3 = new Gtk.LinkButton ({image: linkImage8, label: "zpydr@openmailbox.org",
            uri: "mailto:zpydr@openmailbox.org"});
        labelLink3.set_always_show_image(true);
        this.gridTaskBar.attach(labelLink3, 1, 3, 3, 1);
        let labelLink1 = new Gtk.LinkButton ({image: linkImage1, label: " extensions.gnome.org",
            uri: "https://extensions.gnome.org/extension/584/taskbar", xalign: 0});
        labelLink1.set_always_show_image(true);
        this.gridTaskBar.attach(labelLink1, 1, 4, 1, 1);
        let labelLink2 = new Gtk.LinkButton ({image: linkImage2, label: " github.com",
            uri: "https://github.com/zpydr/gnome-shell-extension-taskbar", xalign: 0 });
        labelLink2.set_always_show_image(true);
        this.gridTaskBar.attach(labelLink2, 1, 5, 1, 1);
        let bugReport = new Gtk.LinkButton ({image: linkImage4, label: _("Report a Bug"),
            uri: "mailto:zpydr@openmailbox.org?subject=TaskBar Bug Report&Body=TaskBar Bug Report%0D%0A%0D%0ATaskBar Version: 52%0D%0AGNOME Shell Version: %0D%0AOperating System: %0D%0AOS Version: %0D%0A%0D%0ABug Description: %0D%0A%0D%0A", xalign: 0 });
        bugReport.set_always_show_image(true);
        this.gridTaskBar.attach(bugReport, 1, 6, 1, 1);
        let labelLink4 = new Gtk.LinkButton ({image: linkImage5, label: " "+_("Donate for TaskBar"),
            uri: "https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=U5LCPU7B3FB9S", xalign: 0 });
        labelLink4.set_always_show_image(true);
        this.gridTaskBar.attach(labelLink4, 3, 4, 1, 1);
        let labelLink5 = new Gtk.LinkButton ({image: linkImage6, label: " "+_("Become a Friend of GNOME"),
            uri: "https://www.gnome.org/friends/", xalign: 0 });
        labelLink5.set_always_show_image(true);
        this.gridTaskBar.attach(labelLink5, 3, 5, 1, 1);
        let labelLink6 = new Gtk.LinkButton ({image: linkImage7, label: " "+_("Free Software Foundation"),
            uri: "https://www.fsf.org/", xalign: 0 });
        labelLink6.set_always_show_image(true);
        this.gridTaskBar.attach(labelLink6, 3, 6, 1, 1);

        let resetAllButton = new Gtk.Button({label: _("RESET ALL !")});
        resetAllButton.modify_fg(Gtk.StateType.NORMAL, new Gdk.Color({red: 65535, green: 0, blue: 0}));
        resetAllButton.connect('clicked', Lang.bind(this, this.resetAll));
        resetAllButton.set_tooltip_text(_("Reset All TaskBar Settings to the Original TaskBar Settings"));
        this.gridTaskBar.attach(resetAllButton, 1, 8, 1, 1);

        let labelSpaceTaskBar1 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridTaskBar.attach(labelSpaceTaskBar1, 0, 9, 1, 1);
        let labelSpaceTaskBar2 = new Gtk.Label({label: "\t", xalign: 0,  hexpand: true});
        this.gridTaskBar.attach(labelSpaceTaskBar2, 2, 1, 1, 1);
        let labelSpaceTaskBar3 = new Gtk.Label({label: "<b>"+_("TaskBar")+"</b>", hexpand: true});
        labelSpaceTaskBar3.set_use_markup(true);
        this.gridTaskBar.attach(labelSpaceTaskBar3, 0, 0, 5, 1);
        let labelSpaceTaskBar4 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridTaskBar.attach(labelSpaceTaskBar4, 4, 7, 1, 1);

        this.gridComponents = new Gtk.Grid();
        this.gridComponents.margin = this.gridComponents.row_spacing = 10;
        this.gridComponents.column_spacing = 2;

        let scrollWindowComponents = this.gridComponents;

        scrollWindowComponents.show_all();
        let labelComponents = new Gtk.Label({label: _("Overview")});
        notebook.append_page(scrollWindowComponents, labelComponents);

        let labelDisplayTasks = new Gtk.Label({label: _("Tasks"), xalign: 0});
        this.gridComponents.attach(labelDisplayTasks, 1, 1, 1, 1);
        this.valueDisplayTasks = new Gtk.Switch({active: this.settings.get_boolean("display-tasks")});
        this.valueDisplayTasks.connect('notify::active', Lang.bind(this, this.changeDisplayTasks));
        this.gridComponents.attach(this.valueDisplayTasks, 3, 1, 2, 1);

        let labelDisplayDesktopButton = new Gtk.Label({label: _("Desktop Button"), xalign: 0});
        this.gridComponents.attach(labelDisplayDesktopButton, 1, 2, 1, 1);
        this.valueDisplayDesktopButton = new Gtk.Switch({active: this.settings.get_boolean("display-desktop-button")});
        this.valueDisplayDesktopButton.connect('notify::active', Lang.bind(this, this.changeDisplayDesktopButton));
        this.gridComponents.attach(this.valueDisplayDesktopButton, 3, 2, 2, 1);

        let labelDisplayWorkspaceButton = new Gtk.Label({label: _("Workspace Button"), xalign: 0});
        this.gridComponents.attach(labelDisplayWorkspaceButton, 1, 3, 1, 1);
        this.valueDisplayWorkspaceButton = new Gtk.Switch({active: this.settings.get_boolean("display-workspace-button")});
        this.valueDisplayWorkspaceButton.connect('notify::active', Lang.bind(this, this.changeDisplayWorkspaceButton));
        this.gridComponents.attach(this.valueDisplayWorkspaceButton, 3, 3, 2, 1);

        let labelDisplayShowAppsButton = new Gtk.Label({label: _("Appview Button"), xalign: 0});
        this.gridComponents.attach(labelDisplayShowAppsButton, 1, 4, 1, 1);
        this.valueDisplayShowAppsButton = new Gtk.Switch({active: this.settings.get_boolean("display-showapps-button")});
        this.valueDisplayShowAppsButton.connect('notify::active', Lang.bind(this, this.changeDisplayShowAppsButton));
        this.gridComponents.attach(this.valueDisplayShowAppsButton, 3, 4, 2, 1);

        let labelDisplayFavorites = new Gtk.Label({label: _("Favorites"), xalign: 0});
        this.gridComponents.attach(labelDisplayFavorites, 1, 5, 1, 1);
        this.valueDisplayFavorites = new Gtk.Switch({active: this.settings.get_boolean("display-favorites")});
        this.valueDisplayFavorites.connect('notify::active', Lang.bind(this, this.changeDisplayFavorites));
        this.gridComponents.attach(this.valueDisplayFavorites, 3, 5, 2, 1);

        let valueAppearanceBox = new Gtk.Box();
        let labelAppearanceBox = new Gtk.Label({label: _("Align")+' ', xalign: 0});
        this.valueAppearance = new Gtk.ComboBoxText();
        this.valueAppearance.append_text(_("Tasks"));
        this.valueAppearance.append_text(_("Desktop Button"));
        this.valueAppearance.append_text(_("Workspace Button"));
        this.valueAppearance.append_text(_("Appview Button"));
        this.valueAppearance.append_text(_("Favorites"));
        this.valueAppearance.set_active(this.settings.get_enum("appearance-selection"));
        this.valueAppearance.connect('changed', Lang.bind(this, this.changeAppearanceSelection));
        valueAppearanceBox.add(labelAppearanceBox);
        valueAppearanceBox.add(this.valueAppearance);
        this.gridComponents.attach(valueAppearanceBox, 1, 6, 1, 1);
        let valueAppearanceName = new Gtk.Button({label: "<"});
        let value2AppearanceName = new Gtk.Button({label: ">"});
        valueAppearanceName.connect('clicked', Lang.bind(this, this.changeAppearanceLeft));
        value2AppearanceName.connect('clicked', Lang.bind(this, this.changeAppearanceRight));
        valueAppearanceName.connect('enter-notify-event', Lang.bind(this, this.onHoverEvent));
        valueAppearanceName.connect('leave-notify-event', Lang.bind(this, function()
        {
            this.settings.set_int("hover-event", 0);
        }));
        value2AppearanceName.connect('enter-notify-event', Lang.bind(this, this.onHoverEvent));
        value2AppearanceName.connect('leave-notify-event', Lang.bind(this, function()
        {
            this.settings.set_int("hover-event", 0);
        }));
        this.gridComponents.attach(valueAppearanceName, 3, 6, 1, 1);
        this.gridComponents.attach(value2AppearanceName, 4, 6, 1, 1);

        let labelTopPanel = new Gtk.Label({label: _("Top Panel"), xalign: 0});
        this.gridComponents.attach(labelTopPanel, 1, 7, 1, 1);
        this.valueTopPanel = new Gtk.Switch({active: this.settings.get_boolean("top-panel")});
        this.valueTopPanel.connect('notify::active', Lang.bind(this, this.changeTopPanel));
        this.gridComponents.attach(this.valueTopPanel, 3, 7, 2, 1);

        let labelBottomPanel = new Gtk.Label({label: _("Bottom Panel"), xalign: 0});
        this.gridComponents.attach(labelBottomPanel, 1, 8, 1, 1);
        this.valueBottomPanel = new Gtk.Switch({active: this.settings.get_boolean("bottom-panel")});
        this.valueBottomPanel.connect('notify::active', Lang.bind(this, this.changeBottomPanel));
        this.gridComponents.attach(this.valueBottomPanel, 3, 8, 2, 1);

        let resetComponentsButton = new Gtk.Button({label: _("Reset Overview Tab")});
        resetComponentsButton.modify_fg(Gtk.StateType.NORMAL, new Gdk.Color({red: 65535, green: 0, blue: 0}));
        resetComponentsButton.connect('clicked', Lang.bind(this, this.resetComponents));
        resetComponentsButton.set_tooltip_text(_("Reset the Overview Tab to the Original Overview Settings"));
        this.gridComponents.attach(resetComponentsButton, 1, 10, 1, 1);


        let labelSpaceComponents1 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridComponents.attach(labelSpaceComponents1, 0, 11, 1, 1);
        let labelSpaceComponents2 = new Gtk.Label({label: "\t", xalign: 0, hexpand: true});
        this.gridComponents.attach(labelSpaceComponents2, 2, 9, 1, 1);
        let labelSpaceComponents3 = new Gtk.Label({label: "<b>"+_("Overview")+"</b>", hexpand: true});
        labelSpaceComponents3.set_use_markup(true);
        this.gridComponents.attach(labelSpaceComponents3, 0, 0, 6, 1);
        let labelSpaceComponents4 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridComponents.attach(labelSpaceComponents4, 5, 1, 1, 1);

        this.gridSettings = new Gtk.Grid();
        this.gridSettings.margin = this.gridSettings.row_spacing = 10;
        this.gridSettings.column_spacing = 2;

        let scrollWindowSettings = this.gridSettings;

        scrollWindowSettings.show_all();
        let labelSettings = new Gtk.Label({label: _("Panels")});
        notebook.append_page(scrollWindowSettings, labelSettings);

        let labelPanel3 = new Gtk.Label({label: _("Top Panel")});
        this.gridSettings.attach(labelPanel3, 3, 1, 2, 1);
        let labelPanel4 = new Gtk.Label({label: _("Bottom Panel")});
        this.gridSettings.attach(labelPanel4, 6, 1, 2, 1);

        let labelIconSize = new Gtk.Label({label: _("Panel Height")+" (22 px)", xalign: 0});
        this.gridSettings.attach(labelIconSize, 1, 2, 1, 1);
        this.valueIconSize = new Gtk.Adjustment({lower: 1, upper: 96, step_increment: 1});
        let value2IconSize = new Gtk.SpinButton({adjustment: this.valueIconSize, snap_to_ticks: true});
        value2IconSize.set_value(this.settings.get_int("icon-size"));
        value2IconSize.connect("value-changed", Lang.bind(this, this.changeIconSize));
        this.gridSettings.attach(value2IconSize, 3, 2, 2, 1);
        this.valueIconSizeBottom = new Gtk.Adjustment({lower: 1, upper: 96, step_increment: 1});
        let value2IconSizeBottom = new Gtk.SpinButton({adjustment: this.valueIconSizeBottom, snap_to_ticks: true});
        value2IconSizeBottom.set_value(this.settings.get_int("icon-size-bottom"));
        value2IconSizeBottom.connect("value-changed", Lang.bind(this, this.changeIconSizeBottom));
        this.gridSettings.attach(value2IconSizeBottom, 6, 2, 2, 1);

        let labelPanelPosition = new Gtk.Label({label: _("Align TaskBar"), xalign: 0});
        this.gridSettings.attach(labelPanelPosition, 1, 4, 1, 1);
        let valuePanelPosition = new Gtk.Button({label: "<"});
        let value2PanelPosition = new Gtk.Button({label: ">"});
        valuePanelPosition.connect('clicked', Lang.bind(this, this.changePanelPositionLeft));
        value2PanelPosition.connect('clicked', Lang.bind(this, this.changePanelPositionRight));
        this.gridSettings.attach(valuePanelPosition, 3, 4, 1, 1);
        this.gridSettings.attach(value2PanelPosition, 4, 4, 1, 1);
        let valuePanelPositionBottom = new Gtk.Button({label: "<"});
        let value2PanelPositionBottom = new Gtk.Button({label: ">"});
        valuePanelPositionBottom.connect('clicked', Lang.bind(this, this.changePanelPositionBottomLeft));
        value2PanelPositionBottom.connect('clicked', Lang.bind(this, this.changePanelPositionBottomRight));
        this.gridSettings.attach(valuePanelPositionBottom, 6, 4, 1, 1);
        this.gridSettings.attach(value2PanelPositionBottom, 7, 4, 1, 1);

        let labelBottomPanelVertical = new Gtk.Label({label: _("Anchor Point")+" (0 px)", xalign: 0});
        this.gridSettings.attach(labelBottomPanelVertical, 1, 5, 1, 1);
        this.valueBottomPanelVertical = new Gtk.Adjustment({lower: -100, upper: 100, step_increment: 1});
        this.value2BottomPanelVertical = new Gtk.SpinButton({adjustment: this.valueBottomPanelVertical, snap_to_ticks: true});
        this.value2BottomPanelVertical.set_value(this.settings.get_int("bottom-panel-vertical"));
        this.value2BottomPanelVertical.connect("value-changed", Lang.bind(this, this.changeBottomPanelVertical));
        this.gridSettings.attach(this.value2BottomPanelVertical, 6, 5, 2, 1);

        let labelPanelBackgroundColor = new Gtk.Label({label: _("Panel Background\nColor & Opacity"), xalign: 0});
        this.gridSettings.attach(labelPanelBackgroundColor, 1, 6, 1, 1);
        let colorTop = this.settings.get_string("top-panel-background-color");
        let colorTopOriginal = this.settings.get_string("top-panel-original-background-color");
        if (colorTop === 'unset')
            colorTop = colorTopOriginal;
        let rgbaTop = new Gdk.RGBA();
        rgbaTop.parse(colorTop);
        this.valueTopPanelBackgroundColor = new Gtk.ColorButton({title: "TaskBar Preferences - Top Panel Background Color"});
        this.valueTopPanelBackgroundColor.set_use_alpha(true);
        this.valueTopPanelBackgroundColor.set_rgba(rgbaTop);
        this.valueTopPanelBackgroundColor.connect('color-set', Lang.bind(this, this.changeTopPanelBackgroundColor));
        this.gridSettings.attach(this.valueTopPanelBackgroundColor, 3, 6, 2, 1);
        let colorBottom = this.settings.get_string("bottom-panel-background-color");
        let colorBottomOriginal = this.settings.get_string("bottom-panel-original-background-color");
        if (colorBottom === 'unset')
        {
            colorBottom = colorTopOriginal;
            if (colorBottomOriginal === 'unset')
                this.settings.set_string("bottom-panel-original-background-color", colorTopOriginal);
        }
        let rgbaBottom = new Gdk.RGBA();
        rgbaBottom.parse(colorBottom);
        this.valueBottomPanelBackgroundColor = new Gtk.ColorButton({title: "TaskBar Preferences - Bottom Panel Background Color"});
        this.valueBottomPanelBackgroundColor.set_use_alpha(true);
        this.valueBottomPanelBackgroundColor.set_rgba(rgbaBottom);
        this.valueBottomPanelBackgroundColor.connect('color-set', Lang.bind(this, this.changeBottomPanelBackgroundColor));
        this.gridSettings.attach(this.valueBottomPanelBackgroundColor, 6, 6, 2, 1);
        this.resetTopPanelBackgroundColorButton = new Gtk.Button({label: _("Reset Color")});
        this.resetTopPanelBackgroundColorButton.connect('clicked', Lang.bind(this, this.resetTopPanelBackgroundColor));
        this.gridSettings.attach(this.resetTopPanelBackgroundColorButton, 3, 7, 2, 1);
        this.resetBottomPanelBackgroundColorButton = new Gtk.Button({label: _("Reset Color")});
        this.resetBottomPanelBackgroundColorButton.connect('clicked', Lang.bind(this, this.resetBottomPanelBackgroundColor));
        this.gridSettings.attach(this.resetBottomPanelBackgroundColorButton, 6, 7, 2, 1);

        let resetSettingsButton = new Gtk.Button({label: _("Reset Panels Tab")});
        resetSettingsButton.modify_fg(Gtk.StateType.NORMAL, new Gdk.Color({red: 65535, green: 0, blue: 0}));
        resetSettingsButton.connect('clicked', Lang.bind(this, this.resetSettings));
        resetSettingsButton.set_tooltip_text(_("Reset the Panels Tab to the Original Panels Settings"));
        this.gridSettings.attach(resetSettingsButton, 1, 9, 1, 1);

        let labelSpaceSettings1 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridSettings.attach(labelSpaceSettings1, 0, 10, 1, 1);
        let labelSpaceSettings2 = new Gtk.Label({label: "\t", xalign: 0, hexpand: true});
        this.gridSettings.attach(labelSpaceSettings2, 2, 2, 1, 1);
        let labelSpaceSettings3 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridSettings.attach(labelSpaceSettings3, 5, 8, 1, 1);
        let labelSpaceSettings4 = new Gtk.Label({label: "<b>"+_("Panels")+"</b>", hexpand: true});
        labelSpaceSettings4.set_use_markup(true);
        this.gridSettings.attach(labelSpaceSettings4, 0, 0, 9, 1);
        let labelSpaceSettings5 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridSettings.attach(labelSpaceSettings5, 8, 1, 1, 1);

        this.gridTasks = new Gtk.Grid();
        this.gridTasks.margin = this.gridTasks.row_spacing = 10;
        this.gridTasks.column_spacing = 2;

        let scrollWindowTasks = this.gridTasks;

        scrollWindowTasks.show_all();
        let labelTasks = new Gtk.Label({label: _("Tasks (I)")});
        notebook.append_page(scrollWindowTasks, labelTasks);

        let labelAllWorkspaces = new Gtk.Label({label: _("Tasks on All Workspaces"), xalign: 0});
        this.gridTasks.attach(labelAllWorkspaces, 1, 1, 1, 1);
        this.valueAllWorkspaces = new Gtk.Switch({active: this.settings.get_boolean("tasks-all-workspaces")});
        this.valueAllWorkspaces.connect('notify::active', Lang.bind(this, this.changeAllWorkspaces));
        this.gridTasks.attach(this.valueAllWorkspaces, 4, 1, 1, 1);

        let labelTasksLabel = new Gtk.Label({label: _("Tasks Label"), xalign: 0});
        this.gridTasks.attach(labelTasksLabel, 1, 2, 1, 1);
        this.valueTasksLabel = new Gtk.Switch({active: this.settings.get_boolean("tasks-label")});
        this.valueTasksLabel.connect('notify::active', Lang.bind(this, this.changeTasksLabel));
        this.gridTasks.attach(this.valueTasksLabel, 4, 2, 1, 1);

        let labelTasksLabelColor = new Gtk.Label({label: _("Tasks Label Color"), xalign: 0});
        this.gridTasks.attach(labelTasksLabelColor, 1, 3, 1, 1);
        let colorTLC = this.settings.get_string("tasks-label-color");
        let rgbaTLC = new Gdk.RGBA();
        rgbaTLC.parse(colorTLC);
        this.valueTasksLabelColor = new Gtk.ColorButton({title: "TaskBar Preferences - Tasks Label Color"});
        this.valueTasksLabelColor.set_use_alpha(true);
        this.valueTasksLabelColor.set_rgba(rgbaTLC);
        this.valueTasksLabelColor.connect('color-set', Lang.bind(this, this.changeTasksLabelColor));
        this.gridTasks.attach(this.valueTasksLabelColor, 3, 3, 1, 1);
        this.value2TasksLabelColor = new Gtk.Switch({active: this.settings.get_boolean("display-tasks-label-color")});
        this.value2TasksLabelColor.connect('notify::active', Lang.bind(this, this.changeTasksLabelColorSet));
        this.gridTasks.attach(this.value2TasksLabelColor, 4, 3, 1, 1);

        let labelTasksLabelWidth = new Gtk.Label({label: _("Tasks Label Width (150 px)"), xalign: 0});
        this.gridTasks.attach(labelTasksLabelWidth, 1, 4, 2, 1);
        this.valueTasksLabelWidth = new Gtk.Adjustment({lower: 0, upper: 1000, step_increment: 1});
        let value2TasksLabelWidth = new Gtk.SpinButton({adjustment: this.valueTasksLabelWidth, snap_to_ticks: true});
        value2TasksLabelWidth.set_value(this.settings.get_int("tasks-width"));
        value2TasksLabelWidth.connect("value-changed", Lang.bind(this, this.changeTasksLabelWidth));
        this.gridTasks.attach(value2TasksLabelWidth, 3, 4, 2, 1);

        let labelTasksContainerWidth = new Gtk.Label({label: _("Tasks Container Width (0 Tasks)"), xalign: 0});
        this.gridTasks.attach(labelTasksContainerWidth, 1, 5, 2, 1);
        this.valueTasksContainerWidth = new Gtk.Adjustment({lower: 0, upper: 100, step_increment: 1});
        let value2TasksContainerWidth = new Gtk.SpinButton({adjustment: this.valueTasksContainerWidth, snap_to_ticks: true});
        value2TasksContainerWidth.set_value(this.settings.get_int("tasks-container-width-new"));
        value2TasksContainerWidth.connect("value-changed", Lang.bind(this, this.changeTasksContainerWidth));
        this.gridTasks.attach(value2TasksContainerWidth, 3, 5, 2, 1);

        let labelTaskMenu = new Gtk.Label({label: _("Tasks Application Menu"), xalign: 0});
        this.gridTasks.attach(labelTaskMenu, 1, 6, 1, 1);
        this.valueTaskMenu = new Gtk.ComboBoxText();
        this.valueTaskMenu.append_text(_("OFF"));
        this.valueTaskMenu.append_text(_("Middle Click"));
        this.valueTaskMenu.append_text(_("Right Click"));
        this.valueTaskMenu.set_active(this.settings.get_enum("task-menu"));
        this.valueTaskMenu.connect('changed', Lang.bind(this, this.changeTaskMenu));
        this.gridTasks.attach(this.valueTaskMenu, 3, 6, 2, 1);

        let labelCloseButton = new Gtk.Label({label: _("Close Tasks"), xalign: 0});
        this.gridTasks.attach(labelCloseButton, 1, 7, 1, 1);
        this.valueCloseButton = new Gtk.ComboBoxText();
        this.valueCloseButton.append_text(_("OFF"));
        this.valueCloseButton.append_text(_("Middle Click"));
        this.valueCloseButton.append_text(_("Right Click"));
        this.valueCloseButton.set_active(this.settings.get_enum("close-button"));
        this.valueCloseButton.connect('changed', Lang.bind(this, this.changeCloseButton));
        this.gridTasks.attach(this.valueCloseButton, 3, 7, 2, 1);

        let labelTasksSpaces = new Gtk.Label({label: _("Space between Tasks (4 px)"), xalign: 0});
        this.gridTasks.attach(labelTasksSpaces, 1, 8, 2, 1);
        this.valueTasksSpaces = new Gtk.Adjustment({lower: 0, upper: 1000, step_increment: 1});
        let value2TasksSpaces = new Gtk.SpinButton({adjustment: this.valueTasksSpaces, snap_to_ticks: true});
        value2TasksSpaces.set_value(this.settings.get_int("tasks-spaces"));
        value2TasksSpaces.connect("value-changed", Lang.bind(this, this.changeTasksSpaces));
        this.gridTasks.attach(value2TasksSpaces, 3, 8, 2, 1);

        let resetTasksButton = new Gtk.Button({label: _("Reset Tasks (I) Tab")});
        resetTasksButton.modify_fg(Gtk.StateType.NORMAL, new Gdk.Color({red: 65535, green: 0, blue: 0}));
        resetTasksButton.connect('clicked', Lang.bind(this, this.resetTasks));
        resetTasksButton.set_tooltip_text(_("Reset the Tasks (I) Tab to the Original Tasks Settings"));
        this.gridTasks.attach(resetTasksButton, 1, 10, 1, 1);

        let labelSpaceTasks1 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridTasks.attach(labelSpaceTasks1, 0, 11, 1, 1);
        let labelSpaceTasks2 = new Gtk.Label({label: "\t", xalign: 0, hexpand: true});
        this.gridTasks.attach(labelSpaceTasks2, 2, 9, 1, 1);
        let labelSpaceTasks3 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridTasks.attach(labelSpaceTasks3, 3, 0, 1, 1);
        let labelSpaceTasks4 = new Gtk.Label({label: "<b>"+_("Tasks (I)")+"</b>", hexpand: true});
        labelSpaceTasks4.set_use_markup(true);
        this.gridTasks.attach(labelSpaceTasks4, 0, 0, 6, 1);
        let labelSpaceTasks5 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridTasks.attach(labelSpaceTasks5, 5, 1, 1, 1);

        this.gridTasks2 = new Gtk.Grid();
        this.gridTasks2.margin = this.gridTasks2.row_spacing = 10;
        this.gridTasks2.column_spacing = 2;

        let scrollWindowTasks2 = this.gridTasks2;

        scrollWindowTasks2.show_all();
        let labelTasks2 = new Gtk.Label({label: _("Tasks (II)")});
        notebook.append_page(scrollWindowTasks2, labelTasks2);

        let labelScrollTasks = new Gtk.Label({label: _("Scroll Tasks"), xalign: 0});
        this.gridTasks2.attach(labelScrollTasks, 1, 1, 1, 1);
        this.valueScrollTasks = new Gtk.ComboBoxText();
        this.valueScrollTasks.append_text(_("OFF"));
        this.valueScrollTasks.append_text(_("Standard"));
        this.valueScrollTasks.append_text(_("Invert"));
        this.valueScrollTasks.set_active(this.settings.get_enum("scroll-tasks"));
        this.valueScrollTasks.connect('changed', Lang.bind(this, this.changeScrollTasks));
        this.gridTasks2.attach(this.valueScrollTasks, 3, 1, 2, 1);

        let labelActiveTaskFrame = new Gtk.Label({label: _("Active Task Frame"), xalign: 0});
        this.gridTasks2.attach(labelActiveTaskFrame, 1, 2, 1, 1);
        this.valueActiveTaskFrame = new Gtk.Switch({active: this.settings.get_boolean("active-task-frame")});
        this.valueActiveTaskFrame.connect('notify::active', Lang.bind(this, this.changeActiveTaskFrame));
        this.gridTasks2.attach(this.valueActiveTaskFrame, 4, 2, 1, 1);

        let labelInactiveTaskFrame = new Gtk.Label({label: _("Inactive Task Frame"), xalign: 0});
        this.gridTasks2.attach(labelInactiveTaskFrame, 1, 3, 1, 1);
        this.valueInactiveTaskFrame = new Gtk.Switch({active: this.settings.get_boolean("inactive-task-frame")});
        this.valueInactiveTaskFrame.connect('notify::active', Lang.bind(this, this.changeInactiveTaskFrame));
        this.gridTasks2.attach(this.valueInactiveTaskFrame, 4, 3, 1, 1);

        let labelActiveTaskBackgroundColor = new Gtk.Label({label: _("Active Task Background\nColor & Opacity"), xalign: 0});
        this.gridTasks2.attach(labelActiveTaskBackgroundColor, 1, 4, 1, 1);
        let color = this.settings.get_string("active-task-background-color");
        let rgba = new Gdk.RGBA();
        rgba.parse(color);
        this.valueActiveTaskBackgroundColor = new Gtk.ColorButton({title: "TaskBar Preferences - Active Task Background Color"});
        this.valueActiveTaskBackgroundColor.set_use_alpha(true);
        this.valueActiveTaskBackgroundColor.set_rgba(rgba);
        this.valueActiveTaskBackgroundColor.connect('color-set', Lang.bind(this, this.changeActiveTaskBackgroundColor));
        this.gridTasks2.attach(this.valueActiveTaskBackgroundColor, 3, 4, 1, 1);
        this.value2ActiveTaskBackgroundColor = new Gtk.Switch({active: this.settings.get_boolean("active-task-background-color-set")});
        this.value2ActiveTaskBackgroundColor.connect('notify::active', Lang.bind(this, this.changeActiveTaskBackgroundColorSet));
        this.gridTasks2.attach(this.value2ActiveTaskBackgroundColor, 4, 4, 1, 1);

        let labelInactiveTaskBackgroundColor = new Gtk.Label({label: _("Inactive Task Background\nColor & Opacity"), xalign: 0});
        this.gridTasks2.attach(labelInactiveTaskBackgroundColor, 1, 5, 1, 1);
        let color = this.settings.get_string("inactive-task-background-color");
        let rgba = new Gdk.RGBA();
        rgba.parse(color);
        this.valueInactiveTaskBackgroundColor = new Gtk.ColorButton({title: "TaskBar Preferences - Inactive Task Background Color"});
        this.valueInactiveTaskBackgroundColor.set_use_alpha(true);
        this.valueInactiveTaskBackgroundColor.set_rgba(rgba);
        this.valueInactiveTaskBackgroundColor.connect('color-set', Lang.bind(this, this.changeInactiveTaskBackgroundColor));
        this.gridTasks2.attach(this.valueInactiveTaskBackgroundColor, 3, 5, 1, 1);
        this.value2InactiveTaskBackgroundColor = new Gtk.Switch({active: this.settings.get_boolean("inactive-task-background-color-set")});
        this.value2InactiveTaskBackgroundColor.connect('notify::active', Lang.bind(this, this.changeInactiveTaskBackgroundColorSet));
        this.gridTasks2.attach(this.value2InactiveTaskBackgroundColor, 4, 5, 1, 1);

        let labelHoverSwitchTask = new Gtk.Label({label: _("Activate Tasks on Hover"), xalign: 0});
        this.gridTasks2.attach(labelHoverSwitchTask, 1, 6, 1, 1);
        this.valueHoverSwitchTask = new Gtk.Switch({active: this.settings.get_boolean("hover-switch-task")});
        this.valueHoverSwitchTask.connect('notify::active', Lang.bind(this, this.changeHoverSwitchTask));
        this.gridTasks2.attach(this.valueHoverSwitchTask, 4, 6, 1, 1);

        let labelHoverDelay = new Gtk.Label({label: _("Hover Delay")+" (350 ms)", xalign: 0});
        this.gridTasks2.attach(labelHoverDelay, 1, 7, 2, 1);
        this.valueHoverDelay = new Gtk.Adjustment({lower: 0, upper: 1000, step_increment: 50});
        let value2HoverDelay = new Gtk.SpinButton({adjustment: this.valueHoverDelay, snap_to_ticks: true});
        value2HoverDelay.set_value(this.settings.get_int("hover-delay"));
        value2HoverDelay.connect("value-changed", Lang.bind(this, this.changeHoverDelay));
        this.gridTasks2.attach(value2HoverDelay, 3, 7, 2, 1);

        let resetTasks2Button = new Gtk.Button({label: _("Reset Tasks (II) Tab")});
        resetTasks2Button.modify_fg(Gtk.StateType.NORMAL, new Gdk.Color({red: 65535, green: 0, blue: 0}));
        resetTasks2Button.connect('clicked', Lang.bind(this, this.resetTasks2));
        resetTasks2Button.set_tooltip_text(_("Reset the Tasks II Tab to the Original Tasks II Settings"));
        this.gridTasks2.attach(resetTasks2Button, 1, 9, 1, 1);

        let labelSpaceTasks21 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridTasks2.attach(labelSpaceTasks21, 0, 10, 1, 1);
        let labelSpaceTasks22 = new Gtk.Label({label: "\t", xalign: 0, hexpand: true});
        this.gridTasks2.attach(labelSpaceTasks22, 2, 8, 1, 1);
        let labelSpaceTasks23 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridTasks2.attach(labelSpaceTasks23, 3, 0, 1, 1);
        let labelSpaceTasks24 = new Gtk.Label({label: "<b>"+_("Tasks (II)")+"</b>", hexpand: true});
        labelSpaceTasks24.set_use_markup(true);
        this.gridTasks2.attach(labelSpaceTasks24, 0, 0, 6, 1);
        let labelSpaceTasks25 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridTasks2.attach(labelSpaceTasks25, 5, 1, 1, 1);

        this.gridButtons = new Gtk.Grid();
        this.gridButtons.margin = this.gridButtons.row_spacing = 10;
        this.gridButtons.column_spacing = 2;

        let scrollWindowButtons = this.gridButtons;

        scrollWindowButtons.show_all();
        let labelButtons = new Gtk.Label({label: _("Buttons")});
        notebook.append_page(scrollWindowButtons, labelButtons);

        let labelDesktopButtonRightClick = new Gtk.Label({label: _("Desktop Button Right Click\nopens Preferences (this)"), xalign: 0});
        this.gridButtons.attach(labelDesktopButtonRightClick, 1, 1, 1, 1);
        this.valueDesktopButtonRightClick = new Gtk.Switch({active: this.settings.get_boolean("desktop-button-right-click")});
        this.valueDesktopButtonRightClick.connect('notify::active', Lang.bind(this, this.changeDesktopButtonRightClick));
        this.gridButtons.attach(this.valueDesktopButtonRightClick, 4, 1, 1, 1);

        let labelDesktopButtonIcon = new Gtk.Label({label: _("Desktop Button Icon"), xalign: 0});
        this.gridButtons.attach(labelDesktopButtonIcon, 1, 2, 1, 1);
        this.desktopIconFilename = this.settings.get_string("desktop-button-icon");
        if (this.desktopIconFilename === 'unset')
            this.desktopIconFilename = DESKTOPICON;
        this.valueDesktopButtonIcon = new Gtk.Image();
        this.loadDesktopIcon();
        this.valueDesktopButtonIcon2 = new Gtk.Button({image: this.valueDesktopButtonIcon});
        this.valueDesktopButtonIcon2.connect('clicked', Lang.bind(this, this.changeDesktopButtonIcon));
        this.gridButtons.attach(this.valueDesktopButtonIcon2, 4, 2, 1, 1);

        let labelWorkspaceButtonIndex = new Gtk.Label({label: _("Workspace Button Index"), xalign: 0});
        this.gridButtons.attach(labelWorkspaceButtonIndex, 1, 3, 1, 1);
        this.valueWorkspaceButtonIndex = new Gtk.ComboBoxText();
        this.valueWorkspaceButtonIndex.append_text(_("Index"));
        this.valueWorkspaceButtonIndex.append_text(_("Index/Total"));
        this.valueWorkspaceButtonIndex.set_active(this.settings.get_enum("workspace-button-index"));
        this.valueWorkspaceButtonIndex.connect('changed', Lang.bind(this, this.changeWorkspaceButtonIndex));
        this.gridButtons.attach(this.valueWorkspaceButtonIndex, 3, 3, 2, 1);

        let labelScrollWorkspaces = new Gtk.Label({label: _("Scroll Workspaces"), xalign: 0});
        this.gridButtons.attach(labelScrollWorkspaces, 1, 4, 1, 1);
        this.valueScrollWorkspaces = new Gtk.ComboBoxText();
        this.valueScrollWorkspaces.append_text(_("OFF"));
        this.valueScrollWorkspaces.append_text(_("Standard"));
        this.valueScrollWorkspaces.append_text(_("Invert"));
        this.valueScrollWorkspaces.set_active(this.settings.get_enum("scroll-workspaces"));
        this.valueScrollWorkspaces.connect('changed', Lang.bind(this, this.changeScrollWorkspaces));
        this.gridButtons.attach(this.valueScrollWorkspaces, 3, 4, 2, 1);

        let labelDisplayWorkspaceButtonColor = new Gtk.Label({label: _("Workspace Button Color"), xalign: 0});
        this.gridButtons.attach(labelDisplayWorkspaceButtonColor, 1, 5, 1, 1);
        let colorWorkspaceButton = this.settings.get_string("workspace-button-color");
        this.valueWorkspaceButtonColor = new Gtk.ColorButton({title: "TaskBar Preferences - Workspace Button Color"});
        this.valueWorkspaceButtonColor.set_use_alpha(true);
        let rgbaWorkspaceButton = new Gdk.RGBA();
        if (colorWorkspaceButton === 'unset')
            colorWorkspaceButton = RESETCOLORWHITE;
        rgbaWorkspaceButton.parse(colorWorkspaceButton);
        this.valueWorkspaceButtonColor.set_rgba(rgbaWorkspaceButton);
        this.valueWorkspaceButtonColor.connect('color-set', Lang.bind(this, this.changeWorkspaceButtonColor));
        this.gridButtons.attach(this.valueWorkspaceButtonColor, 3, 5, 1, 1);
        this.valueDisplayWorkspaceButtonColor = new Gtk.Switch({active: this.settings.get_boolean("display-workspace-button-color")});
        this.valueDisplayWorkspaceButtonColor.connect('notify::active', Lang.bind(this, this.displayWorkspaceButtonColor));
        this.gridButtons.attach(this.valueDisplayWorkspaceButtonColor, 4, 5, 1, 1);

        let labelShowAppsButtonToggle = new Gtk.Label({label: _("Appview Button\nLeft & Right Click Toggle"), xalign: 0});
        this.gridButtons.attach(labelShowAppsButtonToggle, 1, 6, 1, 1);
        this.valueShowAppsButtonToggle = new Gtk.ComboBoxText();
        this.valueShowAppsButtonToggle.append_text(_("L Appview\nR Overview"));
        this.valueShowAppsButtonToggle.append_text(_("L Overview\nR Appview"));
        this.valueShowAppsButtonToggle.set_active(this.settings.get_enum("showapps-button-toggle"));
        this.valueShowAppsButtonToggle.connect('changed', Lang.bind(this, this.changeShowAppsButtonToggle));
        this.gridButtons.attach(this.valueShowAppsButtonToggle, 3, 6, 2, 1);

        let labelAppviewButtonIcon = new Gtk.Label({label: _("Appview Button Icon"), xalign: 0});
        this.gridButtons.attach(labelAppviewButtonIcon, 1, 7, 1, 1);
        this.appviewIconFilename = this.settings.get_string("appview-button-icon");
        if (this.appviewIconFilename === 'unset')
            this.appviewIconFilename = APPVIEWICON;
        this.valueAppviewButtonIcon = new Gtk.Image();
        this.loadAppviewIcon();
        this.valueAppviewButtonIcon2 = new Gtk.Button({image: this.valueAppviewButtonIcon});
        this.valueAppviewButtonIcon2.connect('clicked', Lang.bind(this, this.changeAppviewButtonIcon));
        this.gridButtons.attach(this.valueAppviewButtonIcon2, 4, 7, 1, 1);

        let resetButtonsButton = new Gtk.Button({label: _("Reset Buttons Tab")});
        resetButtonsButton.modify_fg(Gtk.StateType.NORMAL, new Gdk.Color({red: 65535, green: 0, blue: 0}));
        resetButtonsButton.connect('clicked', Lang.bind(this, this.resetButtons));
        resetButtonsButton.set_tooltip_text(_("Reset the Buttons Tab except the Icons to the Original Buttons Settings.\nThe Icons can be Reset within their own Settings."));
        this.gridButtons.attach(resetButtonsButton, 1, 13, 1, 1);

        let labelSpaceButtons1 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridButtons.attach(labelSpaceButtons1, 0, 14, 1, 1);
        let labelSpaceButtons2 = new Gtk.Label({label: "\t", xalign: 0, hexpand: true});
        this.gridButtons.attach(labelSpaceButtons2, 2, 1, 1, 1);
        let labelSpaceButtons3 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridButtons.attach(labelSpaceButtons3, 3, 12, 1, 1);
        let labelSpaceButtons4 = new Gtk.Label({label: "<b>"+_("Buttons")+"</b>", hexpand: true});
        labelSpaceButtons4.set_use_markup(true);
        this.gridButtons.attach(labelSpaceButtons4, 0, 0, 7, 1);
        let labelSpaceButtons5 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridButtons.attach(labelSpaceButtons5, 6, 1, 1, 1);

        this.gridTrayButton = new Gtk.Grid();
        this.gridTrayButton.margin = this.gridTrayButton.row_spacing = 10;
        this.gridTrayButton.column_spacing = 2;

        let scrollWindowTrayButton = this.gridTrayButton;

        scrollWindowTrayButton.show_all();
        let labelTrayButton = new Gtk.Label({label: _("Tray Button")});

        if (ShellVersion[1] <= 14)
            notebook.append_page(scrollWindowTrayButton, labelTrayButton);

        let labelTrayButton = new Gtk.Label({label: _("Bottom Panel Tray Button"), xalign: 0});
        this.gridTrayButton.attach(labelTrayButton, 1, 1, 1, 1);
        this.valueTrayButton = new Gtk.ComboBoxText();
        this.valueTrayButton.append_text(_("OFF"));
        this.valueTrayButton.append_text(_("Icon"));
        this.valueTrayButton.append_text(_("Index"));
        this.valueTrayButton.set_active(this.settings.get_enum("tray-button"));
        this.valueTrayButton.connect('changed', Lang.bind(this, this.changeDisplayTrayButton));
        this.gridTrayButton.attach(this.valueTrayButton, 3, 1, 2, 1);

        let labelTrayButtonEmpty = new Gtk.Label({label: _("When Tray is Empty"), xalign: 0});
        this.gridTrayButton.attach(labelTrayButtonEmpty, 1, 2, 1, 1);
        this.valueTrayButtonEmpty = new Gtk.ComboBoxText();
        this.valueTrayButtonEmpty.append_text(_("Show Icon"));
        this.valueTrayButtonEmpty.append_text(_("Show 0"));
        this.valueTrayButtonEmpty.append_text(_("Hide"));
        this.valueTrayButtonEmpty.set_active(this.settings.get_enum("tray-button-empty"));
        this.valueTrayButtonEmpty.connect('changed', Lang.bind(this, this.changeDisplayTrayButtonEmpty));
        this.gridTrayButton.attach(this.valueTrayButtonEmpty, 3, 2, 2, 1);

        let labelTrayButtonIcon = new Gtk.Label({label: _("Tray Button Icon"), xalign: 0});
        this.gridTrayButton.attach(labelTrayButtonIcon, 1, 3, 1, 1);
        this.trayIconFilename = this.settings.get_string("tray-button-icon");
        if (this.trayIconFilename === 'unset')
            this.trayIconFilename = TRAYICON;
        this.valueTrayButtonIcon = new Gtk.Image();
        this.loadTrayIcon();
        this.valueTrayButtonIcon2 = new Gtk.Button({image: this.valueTrayButtonIcon});
        this.valueTrayButtonIcon2.connect('clicked', Lang.bind(this, this.changeTrayButtonIcon));
        this.gridTrayButton.attach(this.valueTrayButtonIcon2, 4, 3, 1, 1);

        let labelHoverTrayButton = new Gtk.Label({label: _("Activate Tray on Hover"), xalign: 0});
        this.gridTrayButton.attach(labelHoverTrayButton, 1, 4, 1, 1);
        this.valueHoverTrayButton = new Gtk.Switch({active: this.settings.get_boolean("hover-tray-button")});
        this.valueHoverTrayButton.connect('notify::active', Lang.bind(this, this.changeHoverTrayButton));
        this.gridTrayButton.attach(this.valueHoverTrayButton, 4, 4, 1, 1);

        let resetTrayButtonButton = new Gtk.Button({label: _("Reset Tray Button Tab")});
        resetTrayButtonButton.modify_fg(Gtk.StateType.NORMAL, new Gdk.Color({red: 65535, green: 0, blue: 0}));
        resetTrayButtonButton.connect('clicked', Lang.bind(this, this.resetTrayButton));
        resetTrayButtonButton.set_tooltip_text(_("Reset the Tray Button Tab except the Icon to the Original Tray Button Settings.\nThe Icon can be Reset within its own Settings."));
        this.gridTrayButton.attach(resetTrayButtonButton, 1, 6, 1, 1);

        let labelSpaceTrayButton1 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridTrayButton.attach(labelSpaceTrayButton1, 0, 7, 1, 1);
        let labelSpaceTrayButton2 = new Gtk.Label({label: "\t", xalign: 0, hexpand: true});
        this.gridTrayButton.attach(labelSpaceTrayButton2, 2, 1, 1, 1);
        let labelSpaceTrayButton3 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridTrayButton.attach(labelSpaceTrayButton3, 3, 5, 1, 1);
        let labelSpaceTrayButton4 = new Gtk.Label({label: "<b>"+_("Tray Button")+"</b>", hexpand: true});
        labelSpaceTrayButton4.set_use_markup(true);
        this.gridTrayButton.attach(labelSpaceTrayButton4, 0, 0, 7, 1);
        let labelSpaceTrayButton5 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridTrayButton.attach(labelSpaceTrayButton5, 6, 1, 1, 1);

        this.gridSeparator = new Gtk.Grid();
        this.gridSeparator.margin = this.gridSeparator.row_spacing = 10;
        this.gridSeparator.column_spacing = 2;

        let scrollWindowSeparator = this.gridSeparator;

        scrollWindowSeparator.show_all();
        let labelSeparator = new Gtk.Label({label: _("Separators")});
        notebook.append_page(scrollWindowSeparator, labelSeparator);

        let labelPanel5 = new Gtk.Label({label: _("Left (px)")});
        this.gridSeparator.attach(labelPanel5, 3, 1, 2, 1);
        let labelPanel6 = new Gtk.Label({label: _("Right (px)")});
        this.gridSeparator.attach(labelPanel6, 6, 1, 2, 1);

        let labelSeparatorBoxMain = new Gtk.Label({label: _("TaskBar"), xalign: 0});
        this.gridSeparator.attach(labelSeparatorBoxMain, 1, 2, 1, 1);
        this.valueSeparatorLeftBoxMain = new Gtk.Adjustment({lower: 0, upper: 1000, step_increment: 1});
        let value2SeparatorLeftBoxMain = new Gtk.SpinButton({adjustment: this.valueSeparatorLeftBoxMain, snap_to_ticks: true});
        value2SeparatorLeftBoxMain.set_value(this.settings.get_int("separator-left-box-main"));
        value2SeparatorLeftBoxMain.connect("value-changed", Lang.bind(this, this.changeSeparatorLeftBoxMain));
        this.gridSeparator.attach(value2SeparatorLeftBoxMain, 3, 2, 2, 1);
        this.valueSeparatorRightBoxMain = new Gtk.Adjustment({lower: 0, upper: 1000, step_increment: 1});
        let value2SeparatorRightBoxMain = new Gtk.SpinButton({adjustment: this.valueSeparatorRightBoxMain, snap_to_ticks: true});
        value2SeparatorRightBoxMain.set_value(this.settings.get_int("separator-right-box-main"));
        value2SeparatorRightBoxMain.connect("value-changed", Lang.bind(this, this.changeSeparatorRightBoxMain));
        this.gridSeparator.attach(value2SeparatorRightBoxMain, 6, 2, 2, 1);

        let labelSeparatorTasks = new Gtk.Label({label: _("Tasks Container"), xalign: 0});
        this.gridSeparator.attach(labelSeparatorTasks, 1, 3, 1, 1);
        this.valueSeparatorLeftTasks = new Gtk.Adjustment({lower: 0, upper: 1000, step_increment: 1});
        let value2SeparatorLeftTasks = new Gtk.SpinButton({adjustment: this.valueSeparatorLeftTasks, snap_to_ticks: true});
        value2SeparatorLeftTasks.set_value(this.settings.get_int("separator-left-tasks"));
        value2SeparatorLeftTasks.connect("value-changed", Lang.bind(this, this.changeSeparatorLeftTasks));
        this.gridSeparator.attach(value2SeparatorLeftTasks, 3, 3, 2, 1);
        this.valueSeparatorRightTasks = new Gtk.Adjustment({lower: 0, upper: 1000, step_increment: 1});
        let value2SeparatorRightTasks = new Gtk.SpinButton({adjustment: this.valueSeparatorRightTasks, snap_to_ticks: true});
        value2SeparatorRightTasks.set_value(this.settings.get_int("separator-right-tasks"));
        value2SeparatorRightTasks.connect("value-changed", Lang.bind(this, this.changeSeparatorRightTasks));
        this.gridSeparator.attach(value2SeparatorRightTasks, 6, 3, 2, 1);

        let labelSeparatorDesktop = new Gtk.Label({label: _("Desktop Button"), xalign: 0});
        this.gridSeparator.attach(labelSeparatorDesktop, 1, 4, 1, 1);
        this.valueSeparatorLeftDesktop = new Gtk.Adjustment({lower: 0, upper: 1000, step_increment: 1});
        let value2SeparatorLeftDesktop = new Gtk.SpinButton({adjustment: this.valueSeparatorLeftDesktop, snap_to_ticks: true});
        value2SeparatorLeftDesktop.set_value(this.settings.get_int("separator-left-desktop"));
        value2SeparatorLeftDesktop.connect("value-changed", Lang.bind(this, this.changeSeparatorLeftDesktop));
        this.gridSeparator.attach(value2SeparatorLeftDesktop, 3, 4, 2, 1);
        this.valueSeparatorRightDesktop = new Gtk.Adjustment({lower: 0, upper: 1000, step_increment: 1});
        let value2SeparatorRightDesktop = new Gtk.SpinButton({adjustment: this.valueSeparatorRightDesktop, snap_to_ticks: true});
        value2SeparatorRightDesktop.set_value(this.settings.get_int("separator-right-desktop"));
        value2SeparatorRightDesktop.connect("value-changed", Lang.bind(this, this.changeSeparatorRightDesktop));
        this.gridSeparator.attach(value2SeparatorRightDesktop, 6, 4, 2, 1);

        let labelSeparatorWorkspaces = new Gtk.Label({label: _("Workspace Button"), xalign: 0});
        this.gridSeparator.attach(labelSeparatorWorkspaces, 1, 5, 1, 1);
        this.valueSeparatorLeftWorkspaces = new Gtk.Adjustment({lower: 0, upper: 1000, step_increment: 1});
        let value2SeparatorLeftWorkspaces = new Gtk.SpinButton({adjustment: this.valueSeparatorLeftWorkspaces, snap_to_ticks: true});
        value2SeparatorLeftWorkspaces.set_value(this.settings.get_int("separator-left-workspaces"));
        value2SeparatorLeftWorkspaces.connect("value-changed", Lang.bind(this, this.changeSeparatorLeftWorkspaces));
        this.gridSeparator.attach(value2SeparatorLeftWorkspaces, 3, 5, 2, 1);
        this.valueSeparatorRightWorkspaces = new Gtk.Adjustment({lower: 0, upper: 1000, step_increment: 1});
        let value2SeparatorRightWorkspaces = new Gtk.SpinButton({adjustment: this.valueSeparatorRightWorkspaces, snap_to_ticks: true});
        value2SeparatorRightWorkspaces.set_value(this.settings.get_int("separator-right-workspaces"));
        value2SeparatorRightWorkspaces.connect("value-changed", Lang.bind(this, this.changeSeparatorRightWorkspaces));
        this.gridSeparator.attach(value2SeparatorRightWorkspaces, 6, 5, 2, 1);

        let labelSeparatorAppview = new Gtk.Label({label: _("Appview Button"), xalign: 0});
        this.gridSeparator.attach(labelSeparatorAppview, 1, 6, 1, 1);
        this.valueSeparatorLeftAppview = new Gtk.Adjustment({lower: 0, upper: 1000, step_increment: 1});
        let value2SeparatorLeftAppview = new Gtk.SpinButton({adjustment: this.valueSeparatorLeftAppview, snap_to_ticks: true});
        value2SeparatorLeftAppview.set_value(this.settings.get_int("separator-left-appview"));
        value2SeparatorLeftAppview.connect("value-changed", Lang.bind(this, this.changeSeparatorLeftAppview));
        this.gridSeparator.attach(value2SeparatorLeftAppview, 3, 6, 2, 1);
        this.valueSeparatorRightAppview = new Gtk.Adjustment({lower: 0, upper: 1000, step_increment: 1});
        let value2SeparatorRightAppview = new Gtk.SpinButton({adjustment: this.valueSeparatorRightAppview, snap_to_ticks: true});
        value2SeparatorRightAppview.set_value(this.settings.get_int("separator-right-appview"));
        value2SeparatorRightAppview.connect("value-changed", Lang.bind(this, this.changeSeparatorRightAppview));
        this.gridSeparator.attach(value2SeparatorRightAppview, 6, 6, 2, 1);

        let labelSeparatorFavorites = new Gtk.Label({label: _("Favorites"), xalign: 0});
        this.gridSeparator.attach(labelSeparatorFavorites, 1, 7, 1, 1);
        this.valueSeparatorLeftFavorites = new Gtk.Adjustment({lower: 0, upper: 1000, step_increment: 1});
        let value2SeparatorLeftFavorites = new Gtk.SpinButton({adjustment: this.valueSeparatorLeftFavorites, snap_to_ticks: true});
        value2SeparatorLeftFavorites.set_value(this.settings.get_int("separator-left-favorites"));
        value2SeparatorLeftFavorites.connect("value-changed", Lang.bind(this, this.changeSeparatorLeftFavorites));
        this.gridSeparator.attach(value2SeparatorLeftFavorites, 3, 7, 2, 1);
        this.valueSeparatorRightFavorites = new Gtk.Adjustment({lower: 0, upper: 1000, step_increment: 1});
        let value2SeparatorRightFavorites = new Gtk.SpinButton({adjustment: this.valueSeparatorRightFavorites, snap_to_ticks: true});
        value2SeparatorRightFavorites.set_value(this.settings.get_int("separator-right-favorites"));
        value2SeparatorRightFavorites.connect("value-changed", Lang.bind(this, this.changeSeparatorRightFavorites));
        this.gridSeparator.attach(value2SeparatorRightFavorites, 6, 7, 2, 1);

        let resetSeparatorButton = new Gtk.Button({label: _("Reset Separators Tab")});
        resetSeparatorButton.modify_fg(Gtk.StateType.NORMAL, new Gdk.Color({red: 65535, green: 0, blue: 0}));
        resetSeparatorButton.connect('clicked', Lang.bind(this, this.resetSeparators));
        resetSeparatorButton.set_tooltip_text(_("Reset the Separators Tab to the Original Separators Settings"));
        this.gridSeparator.attach(resetSeparatorButton, 1, 9, 1, 1);

        let labelSpaceSeparator1 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridSeparator.attach(labelSpaceSeparator1, 0, 10, 1, 1);
        let labelSpaceSeparator2 = new Gtk.Label({label: "\t", xalign: 0,  hexpand: true});
        this.gridSeparator.attach(labelSpaceSeparator2, 2, 0, 1, 1);
        let labelSpaceSeparator3 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridSeparator.attach(labelSpaceSeparator3, 3, 0, 1, 1);
        let labelSpaceSeparator4 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridSeparator.attach(labelSpaceSeparator4, 5, 8, 1, 1);
        let labelSpaceSeparator5 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridSeparator.attach(labelSpaceSeparator5, 6, 0, 1, 1);
        let labelSpaceSeparator6 = new Gtk.Label({label: "<b>"+_("Separators")+"</b>", hexpand: true});
        labelSpaceSeparator6.set_use_markup(true);
        this.gridSeparator.attach(labelSpaceSeparator6, 0, 0, 9, 1);
        let labelSpaceSeparator7 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridSeparator.attach(labelSpaceSeparator7, 8, 1, 1, 1);

        this.gridPreview = new Gtk.Grid();
        this.gridPreview.margin = this.gridPreview.row_spacing = 10;
        this.gridPreview.column_spacing = 2;

        let scrollWindowPreview = this.gridPreview;

        scrollWindowPreview.show_all();
        let labelPreview = new Gtk.Label({label: _("Preview")});
        notebook.append_page(scrollWindowPreview, labelPreview);

        let labelDisplayLabel = new Gtk.Label({label: _("Tasks Label"), xalign: 0});
        this.gridPreview.attach(labelDisplayLabel, 1, 1, 1, 1);
        this.valueDisplayLabel = new Gtk.Switch({active: this.settings.get_boolean("display-label")});
        this.valueDisplayLabel.connect('notify::active', Lang.bind(this, this.changeDisplayLabel));
        this.gridPreview.attach(this.valueDisplayLabel, 4, 1, 1, 1);

        let labelDisplayThumbnail = new Gtk.Label({label: _("Tasks Thumbnail"), xalign: 0});
        this.gridPreview.attach(labelDisplayThumbnail, 1, 2, 1, 1);
        this.valueDisplayThumbnail = new Gtk.Switch({active: this.settings.get_boolean("display-thumbnail")});
        this.valueDisplayThumbnail.connect('notify::active', Lang.bind(this, this.changeDisplayThumbnail));
        this.gridPreview.attach(this.valueDisplayThumbnail, 4, 2, 1, 1);

        let labelDisplayFavoritesLabel = new Gtk.Label({label: _("Favorites Label"), xalign: 0});
        this.gridPreview.attach(labelDisplayFavoritesLabel, 1, 3, 1, 1);
        this.valueDisplayFavoritesLabel = new Gtk.Switch({active: this.settings.get_boolean("display-favorites-label")});
        this.valueDisplayFavoritesLabel.connect('notify::active', Lang.bind(this, this.changeDisplayFavoritesLabel));
        this.gridPreview.attach(this.valueDisplayFavoritesLabel, 4, 3, 1, 1);

        let labelPreviewSize = new Gtk.Label({label: _("Thumbnail Size")+" (350 px)", xalign: 0});
        this.gridPreview.attach(labelPreviewSize, 1, 4, 1, 1);
        this.valuePreviewSize = new Gtk.Adjustment({lower: 100, upper: 1000, step_increment: 10});
        let value2PreviewSize = new Gtk.SpinButton({adjustment: this.valuePreviewSize, snap_to_ticks: true});
        value2PreviewSize.set_value(this.settings.get_int("preview-size"));
        value2PreviewSize.connect("value-changed", Lang.bind(this, this.changePreviewSize));
        this.gridPreview.attach(value2PreviewSize, 3, 4, 2, 1);

        let labelPreviewDelay = new Gtk.Label({label: _("Preview Delay")+" (500 ms)", xalign: 0});
        this.gridPreview.attach(labelPreviewDelay, 1, 5, 2, 1);
        this.valuePreviewDelay = new Gtk.Adjustment({lower: 0, upper: 3000, step_increment: 50});
        let value2PreviewDelay = new Gtk.SpinButton({adjustment: this.valuePreviewDelay, snap_to_ticks: true});
        value2PreviewDelay.set_value(this.settings.get_int("preview-delay"));
        value2PreviewDelay.connect("value-changed", Lang.bind(this, this.changePreviewDelay));
        this.gridPreview.attach(value2PreviewDelay, 3, 5, 2, 1);

        let resetPreviewButton = new Gtk.Button({label: _("Reset Preview Tab")});
        resetPreviewButton.modify_fg(Gtk.StateType.NORMAL, new Gdk.Color({red: 65535, green: 0, blue: 0}));
        resetPreviewButton.connect('clicked', Lang.bind(this, this.resetPreview));
        resetPreviewButton.set_tooltip_text(_("Reset the Preview Tab to the Original Preview Settings"));
        this.gridPreview.attach(resetPreviewButton, 1, 7, 1, 1);

        let labelSpacePreview1 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridPreview.attach(labelSpacePreview1, 0, 8, 1, 1);
        let labelSpacePreview2 = new Gtk.Label({label: "\t", xalign: 0,  hexpand: true});
        this.gridPreview.attach(labelSpacePreview2, 2, 1, 1, 1);
        let labelSpacePreview3 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridPreview.attach(labelSpacePreview3, 3, 6, 1, 1);
        let labelSpacePreview4 = new Gtk.Label({label: "<b>"+_("Preview")+"</b>", hexpand: true});
        labelSpacePreview4.set_use_markup(true);
        this.gridPreview.attach(labelSpacePreview4, 0, 0, 6, 1);
        let labelSpacePreview5 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridPreview.attach(labelSpacePreview5, 5, 1, 1, 1);

        this.gridMisc = new Gtk.Grid();
        this.gridMisc.margin = this.gridMisc.row_spacing = 10;
        this.gridMisc.column_spacing = 2;

        let scrollWindowMisc = this.gridMisc;

        scrollWindowMisc.show_all();
        let labelMisc = new Gtk.Label({label: _("Misc")});
        notebook.append_page(scrollWindowMisc, labelMisc);

        let labelColor = new Gtk.Label({label: _("Color & Opacity")});
        this.gridMisc.attach(labelColor, 5, 1, 2, 1);

        let labelDisplayActivitiesButton = new Gtk.Label({label: _("Activities Button"), xalign: 0});
        this.gridMisc.attach(labelDisplayActivitiesButton, 1, 2, 1, 1);
        this.valueDisplayActivitiesButton = new Gtk.Switch({active: this.settings.get_boolean("activities-button")});
        this.valueDisplayActivitiesButton.connect('notify::active', Lang.bind(this, this.changeDisplayActivitiesButton));
        this.gridMisc.attach(this.valueDisplayActivitiesButton, 3, 2, 1, 1);
        let colorActivities = this.settings.get_string("activities-button-color");
        this.valueActivitiesColor = new Gtk.ColorButton({title: "TaskBar Preferences - Activities Button Color"});
        this.valueActivitiesColor.set_use_alpha(true);
        let rgbaActivities = new Gdk.RGBA();
        if (colorActivities === 'unset')
            colorActivities = RESETCOLOR;
        rgbaActivities.parse(colorActivities);
        this.valueActivitiesColor.set_rgba(rgbaActivities);
        this.valueActivitiesColor.connect('color-set', Lang.bind(this, this.changeActivitiesColor));
        this.gridMisc.attach(this.valueActivitiesColor, 5, 2, 1, 1);
        this.resetActivitiesColorButton = new Gtk.Button({label: _("Reset")});
        this.resetActivitiesColorButton.connect('clicked', Lang.bind(this, this.resetActivitiesColor));
        this.gridMisc.attach(this.resetActivitiesColorButton, 6, 2, 1, 1);

        let labelDisplayApplicationMenu = new Gtk.Label({label: _("Application Menu"), xalign: 0});
        this.gridMisc.attach(labelDisplayApplicationMenu, 1, 3, 1, 1);
        this.valueDisplayApplicationMenu = new Gtk.Switch({active: this.settings.get_boolean("application-menu")});
        this.valueDisplayApplicationMenu.connect('notify::active', Lang.bind(this, this.changeDisplayApplicationMenu));
        this.gridMisc.attach(this.valueDisplayApplicationMenu, 3, 3, 1, 1);
        let colorApplicationMenu = this.settings.get_string("application-menu-color");
        this.valueApplicationMenuColor = new Gtk.ColorButton({title: "TaskBar Preferences - Application Menu Color"});
        this.valueApplicationMenuColor.set_use_alpha(true);
        let rgbaApplicationMenu = new Gdk.RGBA();
        if (colorApplicationMenu === 'unset')
            colorApplicationMenu = RESETCOLOR;
        rgbaApplicationMenu.parse(colorApplicationMenu);
        this.valueApplicationMenuColor.set_rgba(rgbaApplicationMenu);
        this.valueApplicationMenuColor.connect('color-set', Lang.bind(this, this.changeApplicationMenuColor));
        this.gridMisc.attach(this.valueApplicationMenuColor, 5, 3, 1, 1);
        this.resetApplicationMenuColorButton = new Gtk.Button({label: _("Reset")});
        this.resetApplicationMenuColorButton.connect('clicked', Lang.bind(this, this.resetApplicationMenuColor));
        this.gridMisc.attach(this.resetApplicationMenuColorButton, 6, 3, 1, 1);

        let labelDisplayDateMenu = new Gtk.Label({label: _("Date Menu"), xalign: 0});
        this.gridMisc.attach(labelDisplayDateMenu, 1, 4, 1, 1);
        this.valueDisplayDateMenu = new Gtk.Switch({active: this.settings.get_boolean("date-menu")});
        this.valueDisplayDateMenu.connect('notify::active', Lang.bind(this, this.changeDisplayDateMenu));
        this.gridMisc.attach(this.valueDisplayDateMenu, 3, 4, 1, 1);
        let colorDateMenu = this.settings.get_string("date-menu-color");
        this.valueDateMenuColor = new Gtk.ColorButton({title: "TaskBar Preferences - Date Menu Color"});
        this.valueDateMenuColor.set_use_alpha(true);
        let rgbaDateMenu = new Gdk.RGBA();
        if (colorDateMenu === 'unset')
            colorDateMenu = RESETCOLOR;
        rgbaDateMenu.parse(colorDateMenu);
        this.valueDateMenuColor.set_rgba(rgbaDateMenu);
        this.valueDateMenuColor.connect('color-set', Lang.bind(this, this.changeDateMenuColor));
        this.gridMisc.attach(this.valueDateMenuColor, 5, 4, 1, 1);
        this.resetDateMenuColorButton = new Gtk.Button({label: _("Reset")});
        this.resetDateMenuColorButton.connect('clicked', Lang.bind(this, this.resetDateMenuColor));
        this.gridMisc.attach(this.resetDateMenuColorButton, 6, 4, 1, 1);

        let labelDisplaySystemMenu = new Gtk.Label({label: _("System Menu"), xalign: 0});
        this.gridMisc.attach(labelDisplaySystemMenu, 1, 5, 1, 1);
        this.valueDisplaySystemMenu = new Gtk.Switch({active: this.settings.get_boolean("system-menu")});
        this.valueDisplaySystemMenu.connect('notify::active', Lang.bind(this, this.changeDisplaySystemMenu));
        this.gridMisc.attach(this.valueDisplaySystemMenu, 3, 5, 1, 1);
        let colorSystemMenu = this.settings.get_string("system-menu-color");
        this.valueSystemMenuColor = new Gtk.ColorButton({title: "TaskBar Preferences - System Menu Color"});
        this.valueSystemMenuColor.set_use_alpha(true);
        let rgbaSystemMenu = new Gdk.RGBA();
        if (colorSystemMenu === 'unset')
            colorSystemMenu = RESETCOLOR;
        rgbaSystemMenu.parse(colorSystemMenu);
        this.valueSystemMenuColor.set_rgba(rgbaSystemMenu);
        this.valueSystemMenuColor.connect('color-set', Lang.bind(this, this.changeSystemMenuColor));
        this.gridMisc.attach(this.valueSystemMenuColor, 5, 5, 1, 1);
        this.resetSystemMenuColorButton = new Gtk.Button({label: _("Reset")});
        this.resetSystemMenuColorButton.connect('clicked', Lang.bind(this, this.resetSystemMenuColor));
        this.gridMisc.attach(this.resetSystemMenuColorButton, 6, 5, 1, 1);

        let labelEnableHotCorner = new Gtk.Label({label: _("Hot Corner"), xalign: 0});
        this.gridMisc.attach(labelEnableHotCorner, 1, 6, 1, 1);
        this.valueEnableHotCorner = new Gtk.Switch({active: this.settings.get_boolean("hot-corner")});
        this.valueEnableHotCorner.connect('notify::active', Lang.bind(this, this.changeEnableHotCorner));
        this.gridMisc.attach(this.valueEnableHotCorner, 3, 6, 1, 1);

        let labelDisplayDash = new Gtk.Label({label: _("Dash (Overview)"), xalign: 0});
        this.gridMisc.attach(labelDisplayDash, 1, 7, 1, 1);
        this.valueDisplayDash = new Gtk.Switch({active: this.settings.get_boolean("dash")});
        this.valueDisplayDash.connect('notify::active', Lang.bind(this, this.changeDisplayDash));
        this.gridMisc.attach(this.valueDisplayDash, 3, 7, 1, 1);

        let labelDisplayWorkspaceSelector = new Gtk.Label({label: _("Workspace Selector (Overview)"), xalign: 0});
        this.gridMisc.attach(labelDisplayWorkspaceSelector, 1, 8, 1, 1);
        this.valueDisplayWorkspaceSelector = new Gtk.Switch({active: this.settings.get_boolean("workspace-selector")});
        this.valueDisplayWorkspaceSelector.connect('notify::active', Lang.bind(this, this.changeDisplayWorkspaceSelector));
        this.gridMisc.attach(this.valueDisplayWorkspaceSelector, 3, 8, 1, 1);

        let labelOverview = new Gtk.Label({label: _("TaskBar (Overview)"), xalign: 0});
        this.gridMisc.attach(labelOverview, 1, 9, 1, 1);
        this.valueOverview = new Gtk.Switch({active: this.settings.get_boolean("overview")});
        this.valueOverview.connect('notify::active', Lang.bind(this, this.changeOverview));
        this.gridMisc.attach(this.valueOverview, 3, 9, 1, 1);

        let resetMiscButton = new Gtk.Button({label: _("Reset Misc Tab")});
        resetMiscButton.modify_fg(Gtk.StateType.NORMAL, new Gdk.Color({red: 65535, green: 0, blue: 0}));
        resetMiscButton.connect('clicked', Lang.bind(this, this.resetMisc));
        resetMiscButton.set_tooltip_text(_("Reset the Misc Tab to the Original Misc Settings"));
        this.gridMisc.attach(resetMiscButton, 1, 11, 1, 1);

        let labelSpaceMisc1 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridMisc.attach(labelSpaceMisc1, 0, 12, 1, 1);
        let labelSpaceMisc2 = new Gtk.Label({label: "\t", xalign: 0,  hexpand: true});
        this.gridMisc.attach(labelSpaceMisc2, 2, 1, 1, 1);
        let labelSpaceMisc3 = new Gtk.Label({label: "<b>"+_("Misc")+"</b>", hexpand: true});
        labelSpaceMisc3.set_use_markup(true);
        this.gridMisc.attach(labelSpaceMisc3, 0, 0, 8, 1);
        let labelSpaceMisc4 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridMisc.attach(labelSpaceMisc4, 4, 10, 1, 1);
        let labelSpaceMisc5 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridMisc.attach(labelSpaceMisc5, 7, 10, 1, 1);

        this.gridGPL = new Gtk.Grid();
        this.gridGPL.margin = this.gridGPL.row_spacing = 10;
        this.gridGPL.column_spacing = 2;

        let scrollWindowGPL = this.gridGPL;

        scrollWindowGPL.show_all();
        let labelGPL = new Gtk.Label({label: _("GNU GPL")});
        notebook.append_page(scrollWindowGPL, labelGPL);

        let gplImage = new Gtk.Image({file: GPLICON, xalign: 1});
        let gplSpacer = new Gtk.Image({file: SPACERICON});

        let labelGPL = new Gtk.Label({label: "GNOME Shell Extension TaskBar\nCopyright (C) 2016 zpydr\n\nThis program is free software: you can redistribute it and/or modify\nit under the terms of the GNU General Public License as published by\nthe Free Software Foundation, either version 3 of the License, or\n(at your option) any later version.\n\nThis program is distributed in the hope that it will be useful,\nbut WITHOUT ANY WARRANTY; without even the implied warranty of\nMERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the\nGNU General Public License for more details.\n\nYou should have received a copy of the GNU General Public License\nalong with this program. If not, see", xalign: 0});
        let labelLinkGPL = new Gtk.LinkButton ({image: gplSpacer, label: "https://www.gnu.org/licenses/",
            uri: "https://www.gnu.org/licenses/", xalign: 0});
        let labelEmailLinkGPL = new Gtk.LinkButton ({image: gplSpacer, label: "zpydr@openmailbox.org",
            uri: "mailto:zpydr@openmailbox.org", xalign: 0});
        this.gridGPL.attach(labelGPL, 1, 1, 2, 1);
        this.gridGPL.attach(labelLinkGPL, 1, 2, 1, 1);
        this.gridGPL.attach(labelEmailLinkGPL, 1, 3, 1, 1);
        this.gridGPL.attach(gplImage, 2, 3, 1, 1);

        let labelSpaceGPL1 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridGPL.attach(labelSpaceGPL1, 0, 1, 1, 1);
        let labelSpaceGPL2 = new Gtk.Label({label: "\t", xalign: 0,  hexpand: true});
        this.gridGPL.attach(labelSpaceGPL2, 2, 1, 1, 1);
        let labelSpaceGPL3 = new Gtk.Label({label: "<b>"+_("GNU General Public License")+"</b>", hexpand: true});
        labelSpaceGPL3.set_use_markup(true);
        this.gridGPL.attach(labelSpaceGPL3, 0, 0, 4, 1);
        let labelSpaceGPL4 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridGPL.attach(labelSpaceGPL4, 3, 4, 1, 1);

        notebook.set_current_page(1);
        notebook.show_all();
        return notebook;
    },

    changeDisplayTasks: function(object, pspec)
    {
        this.settings.set_boolean("display-tasks", object.active);
    },

    changeDisplayDesktopButton: function(object, pspec)
    {
        this.settings.set_boolean("display-desktop-button", object.active);
    },

    changeDisplayWorkspaceButton: function(object, pspec)
    {
        this.settings.set_boolean("display-workspace-button", object.active);
    },

    changeDisplayShowAppsButton: function(object, pspec)
    {
        this.settings.set_boolean("display-showapps-button", object.active);
    },

    changeDisplayFavorites: function(object, pspec)
    {
        this.settings.set_boolean("display-favorites", object.active);
    },

    changeAppearanceSelection: function(object)
    {
        this.settings.set_enum("appearance-selection", this.valueAppearance.get_active());
    },

    onHoverEvent: function(object)
    {
        this.hoverComponent = this.settings.get_enum("appearance-selection");
        this.settings.set_int("hover-event", this.hoverComponent + 1);
    },

    changePanelPositionLeft: function()
    {
        if (! this.settings.get_boolean("bottom-panel"))
        {
            this.panelPosition = this.settings.get_int("panel-position");
            this.panelBox = this.settings.get_int("panel-box");
            this.positionMaxRight = this.settings.get_int("position-max-right");
            if (this.panelPosition === 0)
            {
                if (this.panelBox > 1)
                {
                    this.signalMax = this.settings.connect("changed::position-max-right", Lang.bind(this, function()
                    {
                        this.settings.disconnect(this.signalMax);
                        this.panelPosition = this.settings.get_int("position-max-right");
                        this.settings.set_int("panel-position", this.panelPosition);
                    })),
                    this.settings.set_int("panel-box", this.panelBox - 1);
                }
            }
            else
                this.settings.set_int("panel-position", this.panelPosition - 1);
        }
    },

    changePanelPositionRight: function()
    {
        if (! this.settings.get_boolean("bottom-panel"))
        {
            this.panelPosition = this.settings.get_int("panel-position");
            this.panelBox = this.settings.get_int("panel-box");
            this.positionMaxRight = this.settings.get_int("position-max-right");
            if (this.panelPosition >= this.positionMaxRight)
            {
                if (this.panelBox < 3)
                {
                    this.settings.set_int("panel-box", this.panelBox + 1);
                    this.settings.set_int("panel-position", 0);
                }
                else
                    this.settings.set_int("panel-position", this.positionMaxRight);
            }
            else
                this.settings.set_int("panel-position", this.panelPosition + 1);
        }
    },

    changePanelPositionBottomLeft: function()
    {
        if (this.settings.get_boolean("bottom-panel"))
        {
            this.panelPositionBottom = this.settings.get_int("position-bottom-box");
            if (this.panelPositionBottom === 1)
                this.settings.set_int("position-bottom-box", 0);
            if (this.panelPositionBottom === 2)
                this.settings.set_int("position-bottom-box", 1);
        }
    },

    changePanelPositionBottomRight: function()
    {
        if (this.settings.get_boolean("bottom-panel"))
        {
            this.panelPositionBottom = this.settings.get_int("position-bottom-box");
            if (this.panelPositionBottom === 0)
                this.settings.set_int("position-bottom-box", 1);
            if (this.panelPositionBottom === 1)
                this.settings.set_int("position-bottom-box", 2);
        }
    },

    changeTopPanel: function(object, pspec)
    {
        this.settings.set_boolean("top-panel", object.active);
    },

    changeBottomPanel: function(object, pspec)
    {
        this.settings.set_boolean("bottom-panel", object.active);
    },

    changeOverview: function(object, pspec)
    {
        this.settings.set_boolean("overview", object.active);
    },

    changeBottomPanelVertical: function(object)
    {
        if (! this.settings.get_boolean("bottom-panel"))
            this.value2BottomPanelVertical.set_value(this.settings.get_int("bottom-panel-vertical"));
        else
            this.settings.set_int("bottom-panel-vertical", this.valueBottomPanelVertical.get_value());
    },

    changeIconSize: function(object)
    {
        this.settings.set_int("icon-size", this.valueIconSize.get_value());
    },

    changeIconSizeBottom: function(object)
    {
        if (! this.settings.get_boolean("bottom-panel"))
            this.valueIconSizeBottom.set_value(this.settings.get_int("icon-size-bottom"));
        else
            this.settings.set_int("icon-size-bottom", this.valueIconSizeBottom.get_value());
    },

    changeFontSize: function(object)
    {

    },

    changeFontSizeBottom: function(object)
    {
        if (! this.settings.get_boolean("bottom-panel"))
            this.valueFontSizeBottom.set_value(this.settings.get_int("font-size-bottom"));
        else
            this.settings.set_int("font-size-bottom", this.valueFontSizeBottom.get_value());
    },

    changeAllWorkspaces: function(object)
    {
        this.settings.set_boolean("tasks-all-workspaces", object.active);
    },

    changeTasksLabel: function(object)
    {
        this.settings.set_boolean("tasks-label", object.active);
    },

    changeTasksLabelWidth: function(object)
    {
        this.settings.set_int("tasks-width", this.valueTasksLabelWidth.get_value());
    },

    changeTasksLabelColor: function()
    {
        this.tasksLabelColor = this.valueTasksLabelColor.get_rgba().to_string();
        this.settings.set_string("tasks-label-color", this.tasksLabelColor);
    },

    changeTasksLabelColorSet: function(object)
    {
        this.settings.set_boolean("display-tasks-label-color", object.active);
    },

    changeTaskMenu: function(object)
    {
        this.settings.set_enum("task-menu", this.valueTaskMenu.get_active());
    },

    changeTasksContainerWidth: function(object)
    {
        this.settings.set_int("tasks-container-width-new", this.valueTasksContainerWidth.get_value());
    },

    changeCloseButton: function(object)
    {
        this.settings.set_enum("close-button", this.valueCloseButton.get_active());
    },

    changeTasksSpaces: function(object)
    {
        this.settings.set_int("tasks-spaces", this.valueTasksSpaces.get_value());
    },

    changeScrollTasks: function(object)
    {
        this.settings.set_enum("scroll-tasks", this.valueScrollTasks.get_active());
    },

    changeActiveTaskFrame: function(object)
    {
        this.settings.set_boolean("active-task-frame", object.active);
    },

    changeInactiveTaskFrame: function(object)
    {
        this.settings.set_boolean("inactive-task-frame", object.active);
    },

    changeActiveTaskBackgroundColor: function()
    {
        this.backgroundColor = this.valueActiveTaskBackgroundColor.get_rgba().to_string();
        this.settings.set_string("active-task-background-color", this.backgroundColor);
    },

    changeActiveTaskBackgroundColorSet: function(object)
    {
        this.settings.set_boolean("active-task-background-color-set", object.active);
    },

    changeInactiveTaskBackgroundColor: function()
    {
        this.inactiveBackgroundColor = this.valueInactiveTaskBackgroundColor.get_rgba().to_string();
        this.settings.set_string("inactive-task-background-color", this.inactiveBackgroundColor);
    },

    changeInactiveTaskBackgroundColorSet: function(object)
    {
        this.settings.set_boolean("inactive-task-background-color-set", object.active);
    },

    changeTopPanelBackgroundColor: function()
    {
        this.topPanelBackgroundColor = this.valueTopPanelBackgroundColor.get_rgba().to_string();
        this.alpha = this.valueTopPanelBackgroundColor.get_alpha();
        if (this.alpha < 65535)
            this.settings.set_boolean("top-panel-background-alpha", true);
        else
            this.settings.set_boolean("top-panel-background-alpha", false);
        this.settings.set_string("top-panel-background-color", this.topPanelBackgroundColor);
    },

    changeBottomPanelBackgroundColor: function()
    {
        this.bottomPanelBackgroundColor = this.valueBottomPanelBackgroundColor.get_rgba().to_string();
        this.settings.set_string("bottom-panel-background-color", this.bottomPanelBackgroundColor);
    },

    resetTopPanelBackgroundColor: function()
    {
        this.settings.set_string("top-panel-background-color", "unset");
        let topPanelOriginalBackgroundColor = this.settings.get_string("top-panel-original-background-color");
        let rgbaTopColor = new Gdk.RGBA();
        rgbaTopColor.parse(topPanelOriginalBackgroundColor);
        this.valueTopPanelBackgroundColor.set_rgba(rgbaTopColor);
    },

    resetBottomPanelBackgroundColor: function()
    {
        this.settings.set_string("bottom-panel-background-color", "unset");
        let bottomPanelOriginalBackgroundColor = this.settings.get_string("bottom-panel-original-background-color");
        let rgbaBottomColor = new Gdk.RGBA();
        rgbaBottomColor.parse(bottomPanelOriginalBackgroundColor);
        this.valueBottomPanelBackgroundColor.set_rgba(rgbaBottomColor);
    },

    changeHoverSwitchTask: function(object)
    {
        this.settings.set_boolean("hover-switch-task", object.active);
    },

    changeHoverDelay: function(object)
    {
        this.settings.set_int("hover-delay", this.valueHoverDelay.get_value());
    },

    changeDesktopButtonIcon: function()
    {
        let iconPath = this.settings.get_string("desktop-button-icon");
        this.dialogDesktopIcon = new Gtk.FileChooserDialog({ title: _("TaskBar Preferences - Desktop Button Icon"), action: Gtk.FileChooserAction.OPEN });
        this.dialogDesktopIcon.add_button(Gtk.STOCK_CANCEL, Gtk.ResponseType.CANCEL);
        this.dialogDesktopIcon.add_button(Gtk.STOCK_OPEN, Gtk.ResponseType.ACCEPT);
        this.dialogDesktopIcon.add_button("RESET", Gtk.ResponseType.NONE);
        this.dialogDesktopIcon.set_filename(iconPath);
        this.preview = new Gtk.Image();
        this.dialogDesktopIcon.set_preview_widget(this.preview);
        this.dialogDesktopIcon.set_use_preview_label(false);
        this.initDesktopIconPath = iconPath;
        this.loadDesktopIconPreview();
        this.initDesktopIconPath = null;
        this.updatePreview = this.dialogDesktopIcon.connect("update-preview", Lang.bind(this, this.loadDesktopIconPreview));
        let filter = new Gtk.FileFilter();
        filter.set_name(_("Images"));
        filter.add_pattern("*.png");
        filter.add_pattern("*.jpg");
        filter.add_pattern("*.gif");
        filter.add_pattern("*.svg");
        filter.add_pattern("*.ico");
        this.dialogDesktopIcon.add_filter(filter);
        let response = this.dialogDesktopIcon.run();
        if(response === -3) //Open
        {
            this.desktopIconFilename = this.dialogDesktopIcon.get_filename();
            if (this.desktopIconFilename !== iconPath)
            {
                iconPath = this.desktopIconFilename;
                this.loadDesktopIcon();
            }
        }
        if(response === -1) //Reset
        {
            this.desktopIconFilename = DESKTOPICON;
            this.loadDesktopIcon();
        }
        this.dialogDesktopIcon.disconnect(this.updatePreview);
        this.dialogDesktopIcon.destroy();
    },

    loadDesktopIcon: function()
    {
        let pixbuf;
        try
        {
            pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(this.desktopIconFilename, 24, 24, null);
        }
        catch (e)
        {
            pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(DESKTOPICON, 24, 24, null);
            this.desktopIconFilename = DESKTOPICON;
        }
        this.valueDesktopButtonIcon.set_from_pixbuf(pixbuf);
        let settings = this.settings.get_string("desktop-button-icon");
        if (this.desktopIconFilename !== settings)
            this.settings.set_string("desktop-button-icon", this.desktopIconFilename);
    },

    loadDesktopIconPreview: function()
    {
        let pixbuf;
        if (this.initDesktopIconPath !== null)
            this.previewFilename = this.initDesktopIconPath;
        else
            this.previewFilename = this.dialogDesktopIcon.get_preview_filename();
        try
        {
            pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(this.previewFilename, 48, 48, null);
            this.preview.set_from_pixbuf(pixbuf);
            have_preview = true;
        }
        catch (e)
        {
            have_preview = false;
        }
        this.dialogDesktopIcon.set_preview_widget_active(have_preview);
    },


    changeDesktopButtonRightClick: function(object, pspec)
    {
        this.settings.set_boolean("desktop-button-right-click", object.active);
    },

    changeWorkspaceButtonIndex: function(object)
    {
        this.settings.set_enum("workspace-button-index", this.valueWorkspaceButtonIndex.get_active());
    },

    changeScrollWorkspaces: function(object)
    {
        this.settings.set_enum("scroll-workspaces", object.active);
    },

    changeWorkspaceButtonColor: function()
    {
        this.workspaceButtonColor = this.valueWorkspaceButtonColor.get_rgba().to_string();
        this.settings.set_string("workspace-button-color", this.workspaceButtonColor);
    },

    displayWorkspaceButtonColor: function(object, pspec)
    {
        this.settings.set_boolean("display-workspace-button-color", object.active);
    },

    changeShowAppsButtonToggle: function(object)
    {
        this.settings.set_enum("showapps-button-toggle", this.valueShowAppsButtonToggle.get_active());
    },

    changeAppviewButtonIcon: function()
    {
        let iconPath = this.settings.get_string("appview-button-icon");
        this.dialogAppviewIcon = new Gtk.FileChooserDialog({ title: _("TaskBar Preferences - Appview Button Icon"), action: Gtk.FileChooserAction.OPEN });
        this.dialogAppviewIcon.add_button(Gtk.STOCK_CANCEL, Gtk.ResponseType.CANCEL);
        this.dialogAppviewIcon.add_button(Gtk.STOCK_OPEN, Gtk.ResponseType.ACCEPT);
        this.dialogAppviewIcon.add_button("RESET", Gtk.ResponseType.NONE);
        this.dialogAppviewIcon.set_filename(iconPath);
        this.preview = new Gtk.Image();
        this.dialogAppviewIcon.set_preview_widget(this.preview);
        this.dialogAppviewIcon.set_use_preview_label(false);
        this.initAppviewIconPath = iconPath;
        this.loadAppviewIconPreview();
        this.initAppviewIconPath = null;
        this.updatePreview = this.dialogAppviewIcon.connect("update-preview", Lang.bind(this, this.loadAppviewIconPreview));
        let filter = new Gtk.FileFilter();
        filter.set_name(_("Images"));
        filter.add_pattern("*.png");
        filter.add_pattern("*.jpg");
        filter.add_pattern("*.gif");
        filter.add_pattern("*.svg");
        filter.add_pattern("*.ico");
        this.dialogAppviewIcon.add_filter(filter);
        let response = this.dialogAppviewIcon.run();
        if(response === -3)
        {
            this.appviewIconFilename = this.dialogAppviewIcon.get_filename();
            if (this.appviewIconFilename !== iconPath)
            {
                iconPath = this.appviewIconFilename;
                this.loadAppviewIcon();
            }
        }
        if(response === -1)
        {
            this.appviewIconFilename = APPVIEWICON;
            this.loadAppviewIcon();
        }
        this.dialogAppviewIcon.disconnect(this.updatePreview);
        this.dialogAppviewIcon.destroy();
    },

    loadAppviewIcon: function()
    {
        let pixbuf;
        try
        {
            pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(this.appviewIconFilename, 24, 24, null);
        }
        catch (e)
        {
            pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(APPVIEWICON, 24, 24, null);
            this.appviewIconFilename = APPVIEWICON;
        }
        this.valueAppviewButtonIcon.set_from_pixbuf(pixbuf);
        let settings = this.settings.get_string("appview-button-icon");
        if (this.appviewIconFilename !== settings)
            this.settings.set_string("appview-button-icon", this.appviewIconFilename);
    },

    loadAppviewIconPreview: function()
    {
        let pixbuf;
        if (this.initAppviewIconPath !== null)
            this.previewFilename = this.initAppviewIconPath;
        else
            this.previewFilename = this.dialogAppviewIcon.get_preview_filename();
        try
        {
            pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(this.previewFilename, 48, 48, null);
            this.preview.set_from_pixbuf(pixbuf);
            have_preview = true;
        }
        catch (e)
        {
            have_preview = false;
        }
        this.dialogAppviewIcon.set_preview_widget_active(have_preview);
    },

    changeDisplayTrayButton: function(object)
    {
        this.settings.set_enum("tray-button", this.valueTrayButton.get_active());
    },

    changeDisplayTrayButtonEmpty: function(object)
    {
        this.settings.set_enum("tray-button-empty", this.valueTrayButtonEmpty.get_active());
    },

    changeTrayButtonIcon: function()
    {
        let iconPath = this.settings.get_string("tray-button-icon");
        this.dialogTrayIcon = new Gtk.FileChooserDialog({ title: _("TaskBar Preferences - Tray Button Icon"), action: Gtk.FileChooserAction.OPEN });
        this.dialogTrayIcon.add_button(Gtk.STOCK_CANCEL, Gtk.ResponseType.CANCEL);
        this.dialogTrayIcon.add_button(Gtk.STOCK_OPEN, Gtk.ResponseType.ACCEPT);
        this.dialogTrayIcon.add_button("RESET", Gtk.ResponseType.NONE);
        this.dialogTrayIcon.set_filename(iconPath);
        this.preview = new Gtk.Image();
        this.dialogTrayIcon.set_preview_widget(this.preview);
        this.dialogTrayIcon.set_use_preview_label(false);
        this.initTrayIconPath = iconPath;
        this.loadTrayIconPreview();
        this.initTrayIconPath = null;
        this.updatePreview = this.dialogTrayIcon.connect("update-preview", Lang.bind(this, this.loadTrayIconPreview));
        let filter = new Gtk.FileFilter();
        filter.set_name(_("Images"));
        filter.add_pattern("*.png");
        filter.add_pattern("*.jpg");
        filter.add_pattern("*.gif");
        filter.add_pattern("*.svg");
        filter.add_pattern("*.ico");
        this.dialogTrayIcon.add_filter(filter);
        let response = this.dialogTrayIcon.run();
        if(response === -3)
        {
            this.trayIconFilename = this.dialogTrayIcon.get_filename();
            if (this.trayIconFilename !== iconPath)
            {
                iconPath = this.trayIconFilename;
                this.loadTrayIcon();
            }
        }
        if(response === -1)
        {
            this.trayIconFilename = TRAYICON;
            this.loadTrayIcon();
        }
        this.dialogTrayIcon.disconnect(this.updatePreview);
        this.dialogTrayIcon.destroy();
    },

    loadTrayIcon: function()
    {
        let pixbuf;
        try
        {
            pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(this.trayIconFilename, 24, 24, null);
        }
        catch (e)
        {
            pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(TRAYICON, 24, 24, null);
            this.trayIconFilename = TRAYICON;
        }
        this.valueTrayButtonIcon.set_from_pixbuf(pixbuf);
        let settings = this.settings.get_string("tray-button-icon");
        if (this.trayIconFilename !== settings)
            this.settings.set_string("tray-button-icon", this.trayIconFilename);
    },

    loadTrayIconPreview: function()
    {
        let pixbuf;
        if (this.initTrayIconPath !== null)
            this.previewFilename = this.initTrayIconPath;
        else
            this.previewFilename = this.dialogTrayIcon.get_preview_filename();
        try
        {
            pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(this.previewFilename, 48, 48, null);
            this.preview.set_from_pixbuf(pixbuf);
            have_preview = true;
        }
        catch (e)
        {
            have_preview = false;
        }
        this.dialogTrayIcon.set_preview_widget_active(have_preview);
    },

    changeHoverTrayButton: function(object, pspec)
    {
        this.settings.set_boolean("hover-tray-button", object.active);
    },

    changeSeparatorLeftBoxMain: function(object)
    {
        this.settings.set_int("separator-left-box-main", this.valueSeparatorLeftBoxMain.get_value());
    },

    changeSeparatorRightBoxMain: function(object)
    {
        this.settings.set_int("separator-right-box-main", this.valueSeparatorRightBoxMain.get_value());
    },

    changeSeparatorLeftTasks: function(object)
    {
        this.settings.set_int("separator-left-tasks", this.valueSeparatorLeftTasks.get_value());
    },

    changeSeparatorRightTasks: function(object)
    {
        this.settings.set_int("separator-right-tasks", this.valueSeparatorRightTasks.get_value());
    },

    changeSeparatorLeftDesktop: function(object)
    {
        this.settings.set_int("separator-left-desktop", this.valueSeparatorLeftDesktop.get_value());
    },

    changeSeparatorRightDesktop: function(object)
    {
        this.settings.set_int("separator-right-desktop", this.valueSeparatorRightDesktop.get_value());
    },

    changeSeparatorLeftWorkspaces: function(object)
    {
        this.settings.set_int("separator-left-workspaces", this.valueSeparatorLeftWorkspaces.get_value());
    },

    changeSeparatorRightWorkspaces: function(object)
    {
        this.settings.set_int("separator-right-workspaces", this.valueSeparatorRightWorkspaces.get_value());
    },

    changeSeparatorLeftAppview: function(object)
    {
        this.settings.set_int("separator-left-appview", this.valueSeparatorLeftAppview.get_value());
    },

    changeSeparatorRightAppview: function(object)
    {
        this.settings.set_int("separator-right-appview", this.valueSeparatorRightAppview.get_value());
    },

    changeSeparatorLeftFavorites: function(object)
    {
        this.settings.set_int("separator-left-favorites", this.valueSeparatorLeftFavorites.get_value());
    },

    changeSeparatorRightFavorites: function(object)
    {
        this.settings.set_int("separator-right-favorites", this.valueSeparatorRightFavorites.get_value());
    },

    changeDisplayActivitiesButton: function(object, pspec)
    {
        this.settings.set_boolean("activities-button", object.active);
    },

    changeActivitiesColor: function()
    {
        this.activitiesColor = this.valueActivitiesColor.get_rgba().to_string();
        this.settings.set_string("activities-button-color", this.activitiesColor);
    },

    resetActivitiesColor: function()
    {
        let color = RESETCOLOR;
        let rgba = new Gdk.RGBA();
        rgba.parse(color);
        this.valueActivitiesColor.set_rgba(rgba);
        this.settings.set_string("activities-button-color", "unset");
    },

    changeEnableHotCorner: function(object, pspec)
    {
        this.settings.set_boolean("hot-corner", object.active);
    },

    changeDisplayApplicationMenu: function(object, pspec)
    {
        this.settings.set_boolean("application-menu", object.active);
    },

    changeApplicationMenuColor: function()
    {
        this.appMenuColor = this.valueApplicationMenuColor.get_rgba().to_string();
        this.settings.set_string("application-menu-color", this.appMenuColor);
    },

    resetApplicationMenuColor: function()
    {
        let color = RESETCOLOR;
        let rgba = new Gdk.RGBA();
        rgba.parse(color);
        this.valueApplicationMenuColor.set_rgba(rgba);
        this.settings.set_string("application-menu-color", "unset");
    },

    changeDisplayDateMenu: function(object, pspec)
    {
        this.settings.set_boolean("date-menu", object.active);
    },

    changeDateMenuColor: function()
    {
        this.dateMenuColor = this.valueDateMenuColor.get_rgba().to_string();
        this.settings.set_string("date-menu-color", this.dateMenuColor);
    },

    resetDateMenuColor: function()
    {
        let color = RESETCOLOR;
        let rgba = new Gdk.RGBA();
        rgba.parse(color);
        this.valueDateMenuColor.set_rgba(rgba);
        this.settings.set_string("date-menu-color", "unset");
    },

    changeDisplaySystemMenu: function(object, pspec)
    {
        this.settings.set_boolean("system-menu", object.active);
    },

    changeSystemMenuColor: function()
    {
        this.systemMenuColor = this.valueSystemMenuColor.get_rgba().to_string();
        this.settings.set_string("system-menu-color", this.systemMenuColor);
    },

    resetSystemMenuColor: function()
    {
        let color = RESETCOLOR;
        let rgba = new Gdk.RGBA();
        rgba.parse(color);
        this.valueSystemMenuColor.set_rgba(rgba);
        this.settings.set_string("system-menu-color", "unset");
    },

    changeDisplayDash: function(object, pspec)
    {
        this.settings.set_boolean("dash", object.active);
    },

    changeDisplayWorkspaceSelector: function(object, pspec)
    {
        this.settings.set_boolean("workspace-selector", object.active);
    },

    changeDisplayLabel: function(object, pspec)
    {
        this.settings.set_boolean("display-label", object.active);
    },

    changeDisplayThumbnail: function(object, pspec)
    {
        this.settings.set_boolean("display-thumbnail", object.active);
    },

    changeDisplayFavoritesLabel: function(object, pspec)
    {
        this.settings.set_boolean("display-favorites-label", object.active);
    },

    changePreviewSize: function(object)
    {
        this.settings.set_int("preview-size", this.valuePreviewSize.get_value());
    },

    changePreviewDelay: function(object)
    {
        this.settings.set_int("preview-delay", this.valuePreviewDelay.get_value());
    },

    changeAppearanceLeft: function()
    {
        this.appearanceSelection = this.settings.get_enum("appearance-selection");
        if (this.appearanceSelection === 0)
        {
            if (! this.settings.get_boolean("display-tasks"))
                return;
            this.appearanceName = "position-tasks";
        }
        if (this.appearanceSelection === 1)
        {
            if (! this.settings.get_boolean("display-desktop-button"))
                return;
            this.appearanceName = "position-desktop-button";
        }
        if (this.appearanceSelection === 2)
        {
            if (! this.settings.get_boolean("display-workspace-button"))
                return;
            this.appearanceName = "position-workspace-button";
        }
        if (this.appearanceSelection === 3)
        {
            if (! this.settings.get_boolean("display-showapps-button"))
                return;
            this.appearanceName = "position-appview-button";
        }
        if (this.appearanceSelection === 4)
        {
            if (! this.settings.get_boolean("display-favorites"))
                return;
            this.appearanceName = "position-favorites";
        }
        this.oldValueAppearance = this.settings.get_int(this.appearanceName);
        if (this.oldValueAppearance === 0)
            return;
        else
            this.newValueAppearance = this.oldValueAppearance - 1;
        this.setAppearance();
    },

    changeAppearanceRight: function()
    {
        this.appearanceSelection = this.settings.get_enum("appearance-selection");
        if (this.appearanceSelection === 0)
        {
            if (! this.settings.get_boolean("display-tasks"))
                return;
            this.appearanceName = "position-tasks";
        }
        if (this.appearanceSelection === 1)
        {
            if (! this.settings.get_boolean("display-desktop-button"))
                return;
            this.appearanceName = "position-desktop-button";
        }
        if (this.appearanceSelection === 2)
        {
            if (! this.settings.get_boolean("display-workspace-button"))
                return;
            this.appearanceName = "position-workspace-button";
        }
        if (this.appearanceSelection === 3)
        {
            if (! this.settings.get_boolean("display-showapps-button"))
                return;
            this.appearanceName = "position-appview-button";
        }
        if (this.appearanceSelection === 4)
        {
            if (! this.settings.get_boolean("display-favorites"))
                return;
            this.appearanceName = "position-favorites";
        }
        this.oldValueAppearance = this.settings.get_int(this.appearanceName);
        if (this.oldValueAppearance === 4)
            return;
        else
            this.newValueAppearance = this.oldValueAppearance + 1;
        this.setAppearance();
    },

    setAppearance: function()
    {
        this.appearances =
        [
            ("position-tasks"),
            ("position-desktop-button"),
            ("position-workspace-button"),
            ("position-appview-button"),
            ("position-favorites")
        ];
        this.appearances.forEach(
            function(appearance)
            {
                this.intAppearance = this.settings.get_int(appearance);
                if (this.intAppearance === this.newValueAppearance)
                    this.resetAppearance = appearance;
            },
            this
        );
        this.settings.set_int(this.appearanceName, this.newValueAppearance);
        this.settings.set_int(this.resetAppearance, this.oldValueAppearance);
        this.settings.set_boolean("position-changed", true);
    },

    resetComponents: function()
    {
        this.settings.set_boolean("reset-flag", true);
        this.valueDisplayTasks.set_active(true);
        this.valueDisplayDesktopButton.set_active(true);
        this.valueDisplayWorkspaceButton.set_active(true);
        this.valueDisplayShowAppsButton.set_active(true);
        this.valueDisplayFavorites.set_active(false);
        this.settings.set_int("hover-event", 0);
        this.valueAppearance.set_active(0);
        this.settings.set_int("position-tasks", 4);
        this.settings.set_int("position-desktop-button", 3);
        this.settings.set_int("position-workspace-button", 2);
        this.settings.set_int("position-appview-button", 1);
        this.settings.set_int("position-favorites", 0);
        this.valueTopPanel.set_active(true);
        this.valueBottomPanel.set_active(false);
        this.settings.set_boolean("position-changed", true);
        this.settings.set_boolean("reset-flag", false);
    },

    resetSettings: function()
    {
        this.settings.set_boolean("reset-flag", true);
        this.settings.set_int("panel-position", 1);
        this.settings.set_int("panel-box", 1);
        this.settings.set_int("position-max-right", 9);
        this.settings.set_int("bottom-panel-vertical", 0);
        this.valueBottomPanelVertical.set_value(0);
        this.settings.set_int("position-bottom-box", 0);
        this.settings.set_int("icon-size", 22);
        this.valueIconSize.set_value(22);
        this.settings.set_int("icon-size-bottom", 22);
        this.valueIconSizeBottom.set_value(22);
        this.settings.set_string("top-panel-background-color", "unset");
        this.settings.set_string("bottom-panel-background-color", "unset");
        let topPanelOriginalBackgroundColor = this.settings.get_string("top-panel-original-background-color");
        let rgba2 = new Gdk.RGBA();
        rgba2.parse(topPanelOriginalBackgroundColor);
        this.valueTopPanelBackgroundColor.set_rgba(rgba2);
        this.valueBottomPanelBackgroundColor.set_rgba(rgba2);
        this.settings.set_boolean("reset-flag", false);
    },

    resetTasks: function()
    {
        this.settings.set_boolean("reset-flag", true);
        this.valueAllWorkspaces.set_active(false);
        this.valueTasksLabel.set_active(false);
        this.valueTasksLabelWidth.set_value(150);
        let color = RESETCOLOR;
        let rgba = new Gdk.RGBA();
        rgba.parse(color);
        this.valueTasksLabelColor.set_rgba(rgba);
        this.settings.set_string("tasks-label-color", "unset");
        this.value2TasksLabelColor.set_active(false);
        this.valueTaskMenu.set_active(2);
        this.valueTasksContainerWidth.set_value(0);
        this.valueCloseButton.set_active(0);
        this.valueTasksSpaces.set_value(4);
        this.settings.set_boolean("reset-flag", false);
    },

    resetTasks2: function()
    {
        this.settings.set_boolean("reset-flag", true);
        this.valueScrollTasks.set_active(0);
        this.valueActiveTaskFrame.set_active(true);
        this.valueInactiveTaskFrame.set_active(false);
        let color = RESETCOLOR;
        let rgba = new Gdk.RGBA();
        rgba.parse(color);
        this.valueActiveTaskBackgroundColor.set_rgba(rgba);
        this.settings.set_string("active-task-background-color", "unset");
        this.value2ActiveTaskBackgroundColor.set_active(false);
        this.valueInactiveTaskBackgroundColor.set_rgba(rgba);
        this.settings.set_string("inactive-task-background-color", "unset");
        this.value2InactiveTaskBackgroundColor.set_active(false);
        this.valueHoverSwitchTask.set_active(false);
        this.valueHoverDelay.set_value(350);
        this.settings.set_boolean("reset-flag", false);
    },

    resetButtons: function()
    {
        this.valueDesktopButtonRightClick.set_active(true);
        this.valueWorkspaceButtonIndex.set_active(0);
        this.valueScrollWorkspaces.set_active(0);
        let color = RESETCOLORWHITE;
        let rgba = new Gdk.RGBA();
        rgba.parse(color);
        this.valueWorkspaceButtonColor.set_rgba(rgba);
        this.settings.set_string("workspace-button-color", "unset");
        this.valueDisplayWorkspaceButtonColor.set_active(false);
        this.valueShowAppsButtonToggle.set_active(0);
    },

    resetTrayButton: function()
    {
        this.settings.set_boolean("reset-flag", true);
        this.valueTrayButton.set_active(0);
        this.valueTrayButtonEmpty.set_active(0);
        this.valueHoverTrayButton.set_active(false);
        this.settings.set_boolean("reset-flag", false);
    },

    resetSeparators: function()
    {
        this.settings.set_boolean("reset-flag", true);
        this.valueSeparatorLeftBoxMain.set_value(0);
        this.valueSeparatorRightBoxMain.set_value(0);
        this.valueSeparatorLeftTasks.set_value(0);
        this.valueSeparatorRightTasks.set_value(0);
        this.valueSeparatorLeftDesktop.set_value(0);
        this.valueSeparatorRightDesktop.set_value(0);
        this.valueSeparatorLeftWorkspaces.set_value(0);
        this.valueSeparatorRightWorkspaces.set_value(0);
        this.valueSeparatorLeftAppview.set_value(0);
        this.valueSeparatorRightAppview.set_value(0);
        this.valueSeparatorLeftFavorites.set_value(0);
        this.valueSeparatorRightFavorites.set_value(0);
        this.settings.set_boolean("reset-flag", false);
    },

    resetPreview: function()
    {
        this.settings.set_boolean("reset-flag", true);
        this.valueDisplayLabel.set_active(true);
        this.valueDisplayThumbnail.set_active(true);
        this.valueDisplayFavoritesLabel.set_active(true);
        this.valuePreviewSize.set_value(350);
        this.valuePreviewDelay.set_value(500);
        this.settings.set_boolean("reset-flag", false);
    },

    resetMisc: function()
    {
        this.settings.set_boolean("reset-flag", true);
        this.valueDisplayActivitiesButton.set_active(true);
        let color = RESETCOLOR;
        let rgba = new Gdk.RGBA();
        rgba.parse(color);
        this.valueActivitiesColor.set_rgba(rgba);
        this.settings.set_string("activities-button-color", "unset");
        this.valueEnableHotCorner.set_active(true);
        this.valueDisplayApplicationMenu.set_active(true);
        this.valueApplicationMenuColor.set_rgba(rgba);
        this.settings.set_string("application-menu-color", "unset");
        this.valueDisplayDateMenu.set_active(true);
        this.valueDateMenuColor.set_rgba(rgba);
        this.settings.set_string("date-menu-color", "unset");
        this.valueDisplaySystemMenu.set_active(true);
        this.valueSystemMenuColor.set_rgba(rgba);
        this.settings.set_string("system-menu-color", "unset");
        this.valueDisplayDash.set_active(true);
        this.valueDisplayWorkspaceSelector.set_active(true);
        this.valueOverview.set_active(true);
        this.settings.set_boolean("reset-flag", false);
    },

    resetAll: function()
    {
        this.resetMisc();
        this.settings.set_boolean("reset-flag", true);
        this.settings.set_boolean("reset-all", true);
    }
}
