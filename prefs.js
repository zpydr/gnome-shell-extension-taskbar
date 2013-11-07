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
const DESKTOPICON = Extension.path + '/images/desktop-button-default.png';
const APPVIEWICON = Extension.path + '/images/appview-button-default.svg';
const HOMEICON = Extension.path + '/images/settings-home.png';
const NEXTICON = Extension.path + '/images/settings-next.png';
const PREVIOUSICON = Extension.path + '/images/settings-previous.png';

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
        this.newValueAppearance = null;
        this.oldValueAppearance = null;

        this.gridComponents = new Gtk.Grid();
        this.gridComponents.margin = this.gridComponents.row_spacing = 10;
        this.gridComponents.column_spacing = 2;
        let scrollWindowComponents = new Gtk.ScrolledWindow(
        {
            'hscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
            'vscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
            'hexpand': true, 'vexpand': true
        });
        scrollWindowComponents.add_with_viewport(this.gridComponents);
        scrollWindowComponents.show_all();
        let labelComponents = new Gtk.Label({label: "Components"});
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
        let labelAppearanceBox = new Gtk.Label({label: _("Align "), xalign: 0});
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
        this.gridComponents.attach(valueAppearanceName, 3, 6, 1, 1);
        this.gridComponents.attach(value2AppearanceName, 4, 6, 1, 1);

        let labelBottomPanel = new Gtk.Label({label: _("Bottom Panel"), xalign: 0});
        this.gridComponents.attach(labelBottomPanel, 1, 7, 1, 1);
        this.valueBottomPanel = new Gtk.Switch({active: this.settings.get_boolean("bottom-panel")});
        this.valueBottomPanel.connect('notify::active', Lang.bind(this, this.changeBottomPanel));
        this.gridComponents.attach(this.valueBottomPanel, 3, 7, 2, 1);

        let labelSpaceComponents1 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridComponents.attach(labelSpaceComponents1, 0, 8, 1, 1);
        let labelSpaceComponents2 = new Gtk.Label({label: "\t", xalign: 0, hexpand: true});
        this.gridComponents.attach(labelSpaceComponents2, 2, 0, 1, 1);
        let labelSpaceComponents3 = new Gtk.Label({label: "1/8", xalign: 1});
        this.gridComponents.attach(labelSpaceComponents3, 5, 0, 1, 1);
        let labelSpaceComponents4 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridComponents.attach(labelSpaceComponents4, 5, 1, 1, 1);

        this.gridSettings = new Gtk.Grid();
        this.gridSettings.margin = this.gridSettings.row_spacing = 10;
        this.gridSettings.column_spacing = 2;
        let scrollWindowSettings = new Gtk.ScrolledWindow(
        {
            'hscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
            'vscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
            'hexpand': true, 'vexpand': true
        });
        scrollWindowSettings.add_with_viewport(this.gridSettings);
        scrollWindowSettings.show_all();
        let labelSettings = new Gtk.Label({label: "Settings"});
        notebook.append_page(scrollWindowSettings, labelSettings);

        let labelPanel3 = new Gtk.Label({label: _("Top Panel"), xalign: 2});
        this.gridSettings.attach(labelPanel3, 3, 1, 2, 1);
        let labelPanel4 = new Gtk.Label({label: _("Bottom Panel"), xalign: 2});
        this.gridSettings.attach(labelPanel4, 6, 1, 1, 1);

        let labelIconSize = new Gtk.Label({label: _("Icon Size")+" [22]", xalign: 0});
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
        this.gridSettings.attach(value2IconSizeBottom, 6, 2, 1, 1);

        let labelFontSize = new Gtk.Label({label: _("Font Size" + " [16]" + "\nWorkspace Button"), xalign: 0});
        this.gridSettings.attach(labelFontSize, 1, 3, 1, 1);
        this.valueFontSize = new Gtk.Adjustment({lower: 1, upper: 96, step_increment: 1});
        let value2FontSize = new Gtk.SpinButton({adjustment: this.valueFontSize, snap_to_ticks: true});
        value2FontSize.set_value(this.settings.get_int("font-size"));
        value2FontSize.connect("value-changed", Lang.bind(this, this.changeFontSize));
        this.gridSettings.attach(value2FontSize, 3, 3, 2, 1);
        this.valueFontSizeBottom = new Gtk.Adjustment({lower: 1, upper: 96, step_increment: 1});
        let value2FontSizeBottom = new Gtk.SpinButton({adjustment: this.valueFontSizeBottom, snap_to_ticks: true});
        value2FontSizeBottom.set_value(this.settings.get_int("font-size-bottom"));
        value2FontSizeBottom.connect("value-changed", Lang.bind(this, this.changeFontSizeBottom));
        this.gridSettings.attach(value2FontSizeBottom, 6, 3, 1, 1);

        let labelPanelPosition = new Gtk.Label({label: _("Align TaskBar"), xalign: 0});
        this.gridSettings.attach(labelPanelPosition, 1, 4, 1, 1);
        let valuePanelPosition = new Gtk.Button({label: "<"});
        let value2PanelPosition = new Gtk.Button({label: ">"});
        valuePanelPosition.connect('clicked', Lang.bind(this, this.changePanelPositionLeft));
        value2PanelPosition.connect('clicked', Lang.bind(this, this.changePanelPositionRight));
        this.gridSettings.attach(valuePanelPosition, 3, 4, 1, 1);
        this.gridSettings.attach(value2PanelPosition, 4, 4, 1, 1);

        let labelBottomPanelVertical = new Gtk.Label({label: _("Vertical Adjustment")+" [0]", xalign: 0});
        this.gridSettings.attach(labelBottomPanelVertical, 1, 5, 1, 1);
        this.valueBottomPanelVertical = new Gtk.Adjustment({lower: -100, upper: 100, step_increment: 1});
        this.value2BottomPanelVertical = new Gtk.SpinButton({adjustment: this.valueBottomPanelVertical, snap_to_ticks: true});
        this.value2BottomPanelVertical.set_value(this.settings.get_int("bottom-panel-vertical"));
        this.value2BottomPanelVertical.connect("value-changed", Lang.bind(this, this.changeBottomPanelVertical));
        this.gridSettings.attach(this.value2BottomPanelVertical, 6, 5, 1, 1);

        let labelSpaceSettings1 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridSettings.attach(labelSpaceSettings1, 0, 6, 1, 1);
        let labelSpaceSettings2 = new Gtk.Label({label: "\t", xalign: 0, hexpand: true});
        this.gridSettings.attach(labelSpaceSettings2, 2, 2, 1, 1);
        let labelSpaceSettings3 = new Gtk.Label({label: "\t\t", xalign: 0});
        this.gridSettings.attach(labelSpaceSettings3, 5, 0, 1, 1);
        let labelSpaceSettings4 = new Gtk.Label({label: "2/8", xalign: 1});
        this.gridSettings.attach(labelSpaceSettings4, 7, 0, 1, 1);
        let labelSpaceSettings5 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridSettings.attach(labelSpaceSettings5, 7, 1, 1, 1);

        this.gridTasks = new Gtk.Grid();
        this.gridTasks.margin = this.gridTasks.row_spacing = 10;
        this.gridTasks.column_spacing = 2;
        let scrollWindowTasks = new Gtk.ScrolledWindow(
        {
            'hscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
            'vscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
            'hexpand': true, 'vexpand': true
        });
        scrollWindowTasks.add_with_viewport(this.gridTasks);
        scrollWindowTasks.show_all();
        let labelTasks = new Gtk.Label({label: "Tasks"});
        notebook.append_page(scrollWindowTasks, labelTasks);

        let labelAllWorkspaces = new Gtk.Label({label: _("Tasks on all Workspaces"), xalign: 0});
        this.gridTasks.attach(labelAllWorkspaces, 1, 1, 1, 1);
        this.valueAllWorkspaces = new Gtk.Switch({active: this.settings.get_boolean("tasks-all-workspaces")});
        this.valueAllWorkspaces.connect('notify::active', Lang.bind(this, this.changeAllWorkspaces));
        this.gridTasks.attach(this.valueAllWorkspaces, 4, 1, 1, 1);

        let labelCloseButton = new Gtk.Label({label: _("Close Tasks"), xalign: 0});
        this.gridTasks.attach(labelCloseButton, 1, 2, 1, 1);
        this.valueCloseButton = new Gtk.ComboBoxText();
        this.valueCloseButton.append_text(_("OFF"));
        this.valueCloseButton.append_text(_("Middle Click"));
        this.valueCloseButton.append_text(_("Right Click"));
        this.valueCloseButton.set_active(this.settings.get_enum("close-button"));
        this.valueCloseButton.connect('changed', Lang.bind(this, this.changeCloseButton));
        this.gridTasks.attach(this.valueCloseButton, 3, 2, 2, 1);

        let labelActiveTaskFrame = new Gtk.Label({label: _("Active Task Frame"), xalign: 0});
        this.gridTasks.attach(labelActiveTaskFrame, 1, 3, 1, 1);
        this.valueActiveTaskFrame = new Gtk.Switch({active: this.settings.get_boolean("active-task-frame")});
        this.valueActiveTaskFrame.connect('notify::active', Lang.bind(this, this.changeActiveTaskFrame));
        this.gridTasks.attach(this.valueActiveTaskFrame, 4, 3, 1, 1);

        let labelActiveTaskBackgroundColor = new Gtk.Label({label: _("Active Task\nBackground Color"), xalign: 0});
        this.gridTasks.attach(labelActiveTaskBackgroundColor, 1, 4, 1, 1);
        let color = this.settings.get_string("active-task-background-color");
        let rgba = new Gdk.RGBA();
        rgba.parse(color);
        this.valueActiveTaskBackgroundColor = new Gtk.ColorButton({title: "TaskBar Preferences - Active Task Background Color"});
        this.valueActiveTaskBackgroundColor.set_use_alpha(true);
        this.valueActiveTaskBackgroundColor.set_rgba(rgba);
        this.valueActiveTaskBackgroundColor.connect('color-set', Lang.bind(this, this.changeActiveTaskBackgroundColor));
        this.gridTasks.attach(this.valueActiveTaskBackgroundColor, 4, 4, 1, 1);

        this.value2ActiveTaskBackgroundColor = new Gtk.Switch({active: this.settings.get_boolean("active-task-background-color-set")});
        this.value2ActiveTaskBackgroundColor.connect('notify::active', Lang.bind(this, this.changeActiveTaskBackgroundColorSet));
        this.gridTasks.attach(this.value2ActiveTaskBackgroundColor, 4, 5, 1, 1);

        let labelHoverSwitchTask = new Gtk.Label({label: _("Activate Tasks on Hover"), xalign: 0});
        this.gridTasks.attach(labelHoverSwitchTask, 1, 6, 1, 1);
        this.valueHoverSwitchTask = new Gtk.Switch({active: this.settings.get_boolean("hover-switch-task")});
        this.valueHoverSwitchTask.connect('notify::active', Lang.bind(this, this.changeHoverSwitchTask));
        this.gridTasks.attach(this.valueHoverSwitchTask, 4, 6, 1, 1);

        let labelHoverDelay = new Gtk.Label({label: _("Hover Delay")+" [350] "+_("(ms)"), xalign: 0});
        this.gridTasks.attach(labelHoverDelay, 1, 7, 2, 1);
        this.valueHoverDelay = new Gtk.Adjustment({lower: 0, upper: 1000, step_increment: 50});
        let value2HoverDelay = new Gtk.SpinButton({adjustment: this.valueHoverDelay, snap_to_ticks: true});
        value2HoverDelay.set_value(this.settings.get_int("hover-delay"));
        value2HoverDelay.connect("value-changed", Lang.bind(this, this.changeHoverDelay));
        this.gridTasks.attach(value2HoverDelay, 3, 7, 2, 1);

        let labelSpaceTasks1 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridTasks.attach(labelSpaceTasks1, 0, 8, 1, 1);
        let labelSpaceTasks2 = new Gtk.Label({label: "\t", xalign: 0, hexpand: true});
        this.gridTasks.attach(labelSpaceTasks2, 2, 0, 1, 1);
        let labelSpaceTasks3 = new Gtk.Label({label: "\t\t", xalign: 0});
        this.gridTasks.attach(labelSpaceTasks3, 3, 0, 1, 1);
        let labelSpaceTasks4 = new Gtk.Label({label: "3/8", xalign: 1});
        this.gridTasks.attach(labelSpaceTasks4, 5, 0, 1, 1);
        let labelSpaceTasks5 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridTasks.attach(labelSpaceTasks5, 5, 1, 1, 1);

        this.gridButtons = new Gtk.Grid();
        this.gridButtons.margin = this.gridButtons.row_spacing = 10;
        this.gridButtons.column_spacing = 2;
        let scrollWindowButtons = new Gtk.ScrolledWindow(
        {
            'hscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
            'vscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
            'hexpand': true, 'vexpand': true
        });
        scrollWindowButtons.add_with_viewport(this.gridButtons);
        scrollWindowButtons.show_all();
        let labelButtons = new Gtk.Label({label: "Buttons"});
        notebook.append_page(scrollWindowButtons, labelButtons);

        let labelDesktopButtonRightClick = new Gtk.Label({label: _("Desktop Button Right Click\nopens Preferences (this)"), xalign: 0});
        this.gridButtons.attach(labelDesktopButtonRightClick, 1, 1, 1, 1);
        this.valueDesktopButtonRightClick = new Gtk.Switch({active: this.settings.get_boolean("desktop-button-right-click")});
        this.valueDesktopButtonRightClick.connect('notify::active', Lang.bind(this, this.changeDesktopButtonRightClick));
        this.gridButtons.attach(this.valueDesktopButtonRightClick, 4, 1, 1, 1);

        let labelDesktopButtonIcon = new Gtk.Label({label: _("Desktop Button Icon"), xalign: 0});
        this.gridButtons.attach(labelDesktopButtonIcon, 1, 2, 1, 1);
        this.desktopIconFilename = this.settings.get_string("desktop-button-icon");
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

        let labelShowAppsButtonToggle = new Gtk.Label({label: _("Appview Button\nL/R Click Toggle"), xalign: 0});
        this.gridButtons.attach(labelShowAppsButtonToggle, 1, 4, 1, 1);
        this.valueShowAppsButtonToggle = new Gtk.ComboBoxText();
        this.valueShowAppsButtonToggle.append_text(_("L Appview\nR Overview"));
        this.valueShowAppsButtonToggle.append_text(_("L Overview\nR Appview"));
        this.valueShowAppsButtonToggle.set_active(this.settings.get_enum("showapps-button-toggle"));
        this.valueShowAppsButtonToggle.connect('changed', Lang.bind(this, this.changeShowAppsButtonToggle));
        this.gridButtons.attach(this.valueShowAppsButtonToggle, 3, 4, 2, 1);

        let labelAppviewButtonIcon = new Gtk.Label({label: _("Appview Button Icon"), xalign: 0});
        this.gridButtons.attach(labelAppviewButtonIcon, 1, 5, 1, 1);
        this.appviewIconFilename = this.settings.get_string("appview-button-icon");
        this.valueAppviewButtonIcon = new Gtk.Image();
        this.loadAppviewIcon();
        this.valueAppviewButtonIcon2 = new Gtk.Button({image: this.valueAppviewButtonIcon});
        this.valueAppviewButtonIcon2.connect('clicked', Lang.bind(this, this.changeAppviewButtonIcon));
        this.gridButtons.attach(this.valueAppviewButtonIcon2, 4, 5, 1, 1);

        let labelSpaceButtons1 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridButtons.attach(labelSpaceButtons1, 0, 6, 1, 1);
        let labelSpaceButtons2 = new Gtk.Label({label: "\t", xalign: 0, hexpand: true});
        this.gridButtons.attach(labelSpaceButtons2, 2, 1, 1, 1);
        let labelSpaceButtons3 = new Gtk.Label({label: "\t\t", xalign: 0});
        this.gridButtons.attach(labelSpaceButtons3, 3, 1, 1, 1);
        let labelSpaceButtons4 = new Gtk.Label({label: "4/8", xalign: 1});
        this.gridButtons.attach(labelSpaceButtons4, 6, 0, 1, 1);
        let labelSpaceButtons5 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridButtons.attach(labelSpaceButtons5, 6, 1, 1, 1);

        this.gridSeparator = new Gtk.Grid();
        this.gridSeparator.margin = this.gridSeparator.row_spacing = 10;
        this.gridSeparator.column_spacing = 2;
        let scrollWindowSeparator = new Gtk.ScrolledWindow(
        {
            'hscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
            'vscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
            'hexpand': true, 'vexpand': true
        });
        scrollWindowSeparator.add_with_viewport(this.gridSeparator);
        scrollWindowSeparator.show_all();
        let labelSeparator = new Gtk.Label({label: "Separators"});
        notebook.append_page(scrollWindowSeparator, labelSeparator);

        let labelPanel5 = new Gtk.Label({label: _("Top Panel"), xalign: 2});
        this.gridSeparator.attach(labelPanel5, 3, 1, 2, 1);
        let labelPanel6 = new Gtk.Label({label: _("Bottom Panel"), xalign: 2});
        this.gridSeparator.attach(labelPanel6, 6, 1, 2, 1);

        let labelSeparatorOne = new Gtk.Label({label: _("Separator 1\t(Left)"), xalign: 0});
        this.gridSeparator.attach(labelSeparatorOne, 1, 2, 1, 1);
        this.valueSeparatorOne = new Gtk.Switch({active: this.settings.get_boolean("separator-one")});
        this.valueSeparatorOne.connect('notify::active', Lang.bind(this, this.changeSeparatorOne));
        this.gridSeparator.attach(this.valueSeparatorOne, 4, 2, 1, 1);
        this.valueSeparatorOneBottom = new Gtk.Switch({active: this.settings.get_boolean("separator-one-bottom")});
        this.valueSeparatorOneBottom.connect('notify::active', Lang.bind(this, this.changeSeparatorOneBottom));
        this.gridSeparator.attach(this.valueSeparatorOneBottom, 7, 2, 1, 1);

        let labelSeparatorTwo = new Gtk.Label({label: _("Separator 2"), xalign: 0});
        this.gridSeparator.attach(labelSeparatorTwo, 1, 3, 1, 1);
        this.valueSeparatorTwo = new Gtk.Switch({active: this.settings.get_boolean("separator-two")});
        this.valueSeparatorTwo.connect('notify::active', Lang.bind(this, this.changeSeparatorTwo));
        this.gridSeparator.attach(this.valueSeparatorTwo, 4, 3, 1, 1);
        this.valueSeparatorTwoBottom = new Gtk.Switch({active: this.settings.get_boolean("separator-two-bottom")});
        this.valueSeparatorTwoBottom.connect('notify::active', Lang.bind(this, this.changeSeparatorTwoBottom));
        this.gridSeparator.attach(this.valueSeparatorTwoBottom, 7, 3, 1, 1);

        let labelSeparatorThree = new Gtk.Label({label: _("Separator 3"), xalign: 0});
        this.gridSeparator.attach(labelSeparatorThree, 1, 4, 1, 1);
        this.valueSeparatorThree = new Gtk.Switch({active: this.settings.get_boolean("separator-three")});
        this.valueSeparatorThree.connect('notify::active', Lang.bind(this, this.changeSeparatorThree));
        this.gridSeparator.attach(this.valueSeparatorThree, 4, 4, 1, 1);
        this.valueSeparatorThreeBottom = new Gtk.Switch({active: this.settings.get_boolean("separator-three-bottom")});
        this.valueSeparatorThreeBottom.connect('notify::active', Lang.bind(this, this.changeSeparatorThreeBottom));
        this.gridSeparator.attach(this.valueSeparatorThreeBottom, 7, 4, 1, 1);

        let labelSeparatorFour = new Gtk.Label({label: _("Separator 4"), xalign: 0});
        this.gridSeparator.attach(labelSeparatorFour, 1, 5, 1, 1);
        this.valueSeparatorFour = new Gtk.Switch({active: this.settings.get_boolean("separator-four")});
        this.valueSeparatorFour.connect('notify::active', Lang.bind(this, this.changeSeparatorFour));
        this.gridSeparator.attach(this.valueSeparatorFour, 4, 5, 1, 1);
        this.valueSeparatorFourBottom = new Gtk.Switch({active: this.settings.get_boolean("separator-four-bottom")});
        this.valueSeparatorFourBottom.connect('notify::active', Lang.bind(this, this.changeSeparatorFourBottom));
        this.gridSeparator.attach(this.valueSeparatorFourBottom, 7, 5, 1, 1);

        let labelSeparatorFive = new Gtk.Label({label: _("Separator 5"), xalign: 0});
        this.gridSeparator.attach(labelSeparatorFive, 1, 6, 1, 1);
        this.valueSeparatorFive = new Gtk.Switch({active: this.settings.get_boolean("separator-five")});
        this.valueSeparatorFive.connect('notify::active', Lang.bind(this, this.changeSeparatorFive));
        this.gridSeparator.attach(this.valueSeparatorFive, 4, 6, 1, 1);
        this.valueSeparatorFiveBottom = new Gtk.Switch({active: this.settings.get_boolean("separator-five-bottom")});
        this.valueSeparatorFiveBottom.connect('notify::active', Lang.bind(this, this.changeSeparatorFiveBottom));
        this.gridSeparator.attach(this.valueSeparatorFiveBottom, 7, 6, 1, 1);

        let labelSeparatorSix = new Gtk.Label({label: _("Separator 6\t(Right)"), xalign: 0});
        this.gridSeparator.attach(labelSeparatorSix, 1, 7, 1, 1);
        this.valueSeparatorSix = new Gtk.Switch({active: this.settings.get_boolean("separator-six")});
        this.valueSeparatorSix.connect('notify::active', Lang.bind(this, this.changeSeparatorSix));
        this.gridSeparator.attach(this.valueSeparatorSix, 4, 7, 1, 1);
        this.valueSeparatorSixBottom = new Gtk.Switch({active: this.settings.get_boolean("separator-six-bottom")});
        this.valueSeparatorSixBottom.connect('notify::active', Lang.bind(this, this.changeSeparatorSixBottom));
        this.gridSeparator.attach(this.valueSeparatorSixBottom, 7, 7, 1, 1);

        let valueSeparatorBox = new Gtk.Box();
        let labelSeparatorBox = new Gtk.Label({label: _("Resize "), xalign: 0});
        this.valueSeparator = new Gtk.ComboBoxText();
        this.valueSeparator.append_text(_("Separator 1"));
        this.valueSeparator.append_text(_("Separator 2"));
        this.valueSeparator.append_text(_("Separator 3"));
        this.valueSeparator.append_text(_("Separator 4"));
        this.valueSeparator.append_text(_("Separator 5"));
        this.valueSeparator.append_text(_("Separator 6"));
        this.separatorSelection = this.settings.get_enum("separator-selection");
        this.valueSeparator.set_active(this.separatorSelection);
        this.valueSeparator.connect('changed', Lang.bind(this, this.changeSeparatorSelection));
        valueSeparatorBox.add(labelSeparatorBox);
        valueSeparatorBox.add(this.valueSeparator);
        this.gridSeparator.attach(valueSeparatorBox, 1, 8, 1, 1);
        this.valueSeparatorSize = new Gtk.Adjustment({lower: 1, upper: 2000, step_increment: 1});
        this.value2SeparatorSize = new Gtk.SpinButton({adjustment: this.valueSeparatorSize, snap_to_ticks: true});
        this.gridSeparator.attach(this.value2SeparatorSize, 3, 8, 2, 1);
        this.valueSeparatorSizeBottom = new Gtk.Adjustment({lower: 1, upper: 2000, step_increment: 1});
        this.value2SeparatorSizeBottom = new Gtk.SpinButton({adjustment: this.valueSeparatorSizeBottom, snap_to_ticks: true});
        this.gridSeparator.attach(this.value2SeparatorSizeBottom, 6, 8, 2, 1);
        this.changeSeparatorSize();

        let labelSpaceSeparator1 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridSeparator.attach(labelSpaceSeparator1, 0, 9, 1, 1);
        let labelSpaceSeparator2 = new Gtk.Label({label: "\t", xalign: 0,  hexpand: true});
        this.gridSeparator.attach(labelSpaceSeparator2, 2, 0, 1, 1);
        let labelSpaceSeparator3 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridSeparator.attach(labelSpaceSeparator3, 3, 0, 1, 1);
        let labelSpaceSeparator4 = new Gtk.Label({label: "\t\t", xalign: 0});
        this.gridSeparator.attach(labelSpaceSeparator4, 5, 0, 1, 1);
        let labelSpaceSeparator5 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridSeparator.attach(labelSpaceSeparator5, 6, 0, 1, 1);
        let labelSpaceSeparator6 = new Gtk.Label({label: "5/8", xalign: 1});
        this.gridSeparator.attach(labelSpaceSeparator6, 8, 0, 1, 1);
        let labelSpaceSeparator7 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridSeparator.attach(labelSpaceSeparator7, 8, 1, 1, 1);

        this.gridPreview = new Gtk.Grid();
        this.gridPreview.margin = this.gridPreview.row_spacing = 10;
        this.gridPreview.column_spacing = 2;
        let scrollWindowPreview = new Gtk.ScrolledWindow(
        {
            'hscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
            'vscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
            'hexpand': true, 'vexpand': true
        });
        scrollWindowPreview.add_with_viewport(this.gridPreview);
        scrollWindowPreview.show_all();
        let labelPreview = new Gtk.Label({label: "Preview"});
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

        let labelPreviewSize = new Gtk.Label({label: _("Thumbnail Size")+" [350]", xalign: 0});
        this.gridPreview.attach(labelPreviewSize, 1, 4, 1, 1);
        this.valuePreviewSize = new Gtk.Adjustment({lower: 100, upper: 1000, step_increment: 50});
        let value2PreviewSize = new Gtk.SpinButton({adjustment: this.valuePreviewSize, snap_to_ticks: true});
        value2PreviewSize.set_value(this.settings.get_int("preview-size"));
        value2PreviewSize.connect("value-changed", Lang.bind(this, this.changePreviewSize));
        this.gridPreview.attach(value2PreviewSize, 3, 4, 2, 1);

        let labelPreviewDelay = new Gtk.Label({label: _("Preview Delay")+" [500] "+_("(ms)"), xalign: 0});
        this.gridPreview.attach(labelPreviewDelay, 1, 5, 2, 1);
        this.valuePreviewDelay = new Gtk.Adjustment({lower: 0, upper: 3000, step_increment: 250});
        let value2PreviewDelay = new Gtk.SpinButton({adjustment: this.valuePreviewDelay, snap_to_ticks: true});
        value2PreviewDelay.set_value(this.settings.get_int("preview-delay"));
        value2PreviewDelay.connect("value-changed", Lang.bind(this, this.changePreviewDelay));
        this.gridPreview.attach(value2PreviewDelay, 3, 5, 2, 1);

        let labelSpacePreview1 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridPreview.attach(labelSpacePreview1, 0, 6, 1, 1);
        let labelSpacePreview2 = new Gtk.Label({label: "\t", xalign: 0,  hexpand: true});
        this.gridPreview.attach(labelSpacePreview2, 2, 1, 1, 1);
        let labelSpacePreview3 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridPreview.attach(labelSpacePreview3, 3, 1, 1, 1);
        let labelSpacePreview4 = new Gtk.Label({label: "6/8", xalign: 1});
        this.gridPreview.attach(labelSpacePreview4, 5, 0, 1, 1);
        let labelSpacePreview5 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridPreview.attach(labelSpacePreview5, 5, 1, 1, 1);

        this.gridMisc = new Gtk.Grid();
        this.gridMisc.margin = this.gridMisc.row_spacing = 10;
        this.gridMisc.column_spacing = 2;
        let scrollWindowMisc = new Gtk.ScrolledWindow(
        {
            'hscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
            'vscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
            'hexpand': true, 'vexpand': true
        });
        scrollWindowMisc.add_with_viewport(this.gridMisc);
        scrollWindowMisc.show_all();
        let labelMisc = new Gtk.Label({label: "Misc"});
        notebook.append_page(scrollWindowMisc, labelMisc);

        let labelHideActivities = new Gtk.Label({label: _("Hide Activities"), xalign: 0});
        this.gridMisc.attach(labelHideActivities, 1, 1, 1, 1);
        this.valueHideActivities = new Gtk.Switch({active: this.settings.get_boolean("hide-activities")});
        this.valueHideActivities.connect('notify::active', Lang.bind(this, this.changeHideActivities));
        this.gridMisc.attach(this.valueHideActivities, 3, 1, 1, 1);

        let labelDisableHotCorner = new Gtk.Label({label: _("Disable Hot Corner"), xalign: 0});
        this.gridMisc.attach(labelDisableHotCorner, 1, 2, 1, 1);
        this.valueDisableHotCorner = new Gtk.Switch({active: this.settings.get_boolean("disable-hotcorner")});
        this.valueDisableHotCorner.connect('notify::active', Lang.bind(this, this.changeDisableHotCorner));
        this.gridMisc.attach(this.valueDisableHotCorner, 3, 2, 1, 1);

        let labelHideDefaultApplicationMenu = new Gtk.Label({label: _("Hide Default App Menu"), xalign: 0});
        this.gridMisc.attach(labelHideDefaultApplicationMenu, 1, 3, 1, 1);
        this.valueHideDefaultApplicationMenu = new Gtk.Switch({active: this.settings.get_boolean("hide-default-application-menu")});
        this.valueHideDefaultApplicationMenu.connect('notify::active', Lang.bind(this, this.changeHideDefaultApplicationMenu));
        this.gridMisc.attach(this.valueHideDefaultApplicationMenu, 3, 3, 1, 1);

        let labelWarning = new Gtk.Label({ label: "<b>! </b>"+_("Possible conflict\nwith other extensions"), use_markup: true, xalign: 0 });
        this.gridMisc.attach(labelWarning, 1, 4, 1, 1);

        let labelSpaceMisc1 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridMisc.attach(labelSpaceMisc1, 0, 5, 1, 1);
        let labelSpaceMisc2 = new Gtk.Label({label: "\t", xalign: 0,  hexpand: true});
        this.gridMisc.attach(labelSpaceMisc2, 2, 1, 1, 1);
        let labelSpaceMisc3 = new Gtk.Label({label: "7/8", xalign: 1});
        this.gridMisc.attach(labelSpaceMisc3, 4, 0, 1, 1);
        let labelSpaceMisc4 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridMisc.attach(labelSpaceMisc4, 4, 1, 1, 1);

        this.gridTaskBar = new Gtk.Grid();
        this.gridTaskBar.margin = this.gridTaskBar.row_spacing = 10;
        this.gridTaskBar.column_spacing = 2;
        let scrollWindowTaskBar = new Gtk.ScrolledWindow(
        {
            'hscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
            'vscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
            'hexpand': true, 'vexpand': true
        });
        scrollWindowTaskBar.add_with_viewport(this.gridTaskBar);
        scrollWindowTaskBar.show_all();
        let labelTaskBar = new Gtk.Label({label: "TaskBar"});
        notebook.append_page(scrollWindowTaskBar, labelTaskBar);

        let linkImage1 = new Gtk.Image({file: HOMEICON});
        let linkImage2 = new Gtk.Image({file: HOMEICON});
        let labelLink1 = new Gtk.LinkButton ({image: linkImage1, label: " extensions.gnome.org",
            uri: "https://extensions.gnome.org/extension/584/taskbar", xalign: 0 });
        if (ShellVersion[1] !== 4)
            labelLink1.set_always_show_image(true);
        let labelVersion = new Gtk.Label({label: _("Version")+" 37"});
        this.gridTaskBar.attach(labelVersion, 1, 1, 1, 1);
        this.gridTaskBar.attach(labelLink1, 3, 1, 1, 1);
        let labelLink2 = new Gtk.LinkButton ({image: linkImage2, label: " github.com",
            uri: "https://github.com/zpydr/gnome-shell-extension-taskbar", xalign: 0 });
        if (ShellVersion[1] !== 4)
            labelLink2.set_always_show_image(true);
        this.gridTaskBar.attach(labelLink2, 3, 2, 1, 1);
        let resetButton = new Gtk.Button({label: _("RESET ALL")});
        resetButton.connect('clicked', Lang.bind(this, this.reset));
        this.gridTaskBar.attach(resetButton, 1, 2, 1, 1);

        let labelSpaceTaskBar1 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridTaskBar.attach(labelSpaceTaskBar1, 0, 3, 1, 1);
        let labelSpaceTaskBar2 = new Gtk.Label({label: "\t", xalign: 0,  hexpand: true});
        this.gridTaskBar.attach(labelSpaceTaskBar2, 2, 1, 1, 1);
        let labelSpaceTaskBar3 = new Gtk.Label({label: "8/8", xalign: 1});
        this.gridTaskBar.attach(labelSpaceTaskBar3, 4, 0, 1, 1);
        let labelSpaceTaskBar4 = new Gtk.Label({label: "\t", xalign: 0});
        this.gridTaskBar.attach(labelSpaceTaskBar4, 4, 1, 1, 1);

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

    changePanelPositionLeft: function()
    {
        if (! this.settings.get_boolean("bottom-panel"))
        {
            this.panelPosition = this.settings.get_int("panel-position");
            this.panelBox = this.settings.get_int("panel-box");
            this.positionMaxRight = this.settings.get_int("position-max-right");
            if (this.panelPosition == 0)
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

    changeBottomPanel: function(object, pspec)
    {
        this.settings.set_boolean("bottom-panel", object.active);
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
        if (this.settings.get_boolean("bottom-panel"))
            this.valueIconSize.set_value(this.settings.get_int("icon-size"));
        else
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
        if (this.settings.get_boolean("bottom-panel"))
            this.valueFontSize.set_value(this.settings.get_int("font-size"));
        else
            this.settings.set_int("font-size", this.valueFontSize.get_value());
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

    changeCloseButton: function(object)
    {
        this.settings.set_enum("close-button", this.valueCloseButton.get_active());
    },

    changeActiveTaskFrame: function(object)
    {
        this.settings.set_boolean("active-task-frame", object.active);
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
        if(response == -3) //Open
        {
            this.desktopIconFilename = this.dialogDesktopIcon.get_filename();
            if (this.desktopIconFilename !== iconPath)
            {
                iconPath = this.desktopIconFilename;
                this.loadDesktopIcon();
            }
        }
        if(response == -1) //Reset
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
        if (this.initDesktopIconPath != null)
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
        if(response == -3)
        {
            this.appviewIconFilename = this.dialogAppviewIcon.get_filename();
            if (this.appviewIconFilename !== iconPath)
            {
                iconPath = this.appviewIconFilename;
                this.loadAppviewIcon();
            }
        }
        if(response == -1)
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
        if (this.initAppviewIconPath != null)
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

    changeSeparatorOne: function(object, pspec)
    {
        this.settings.set_boolean("separator-one", object.active);
    },

    changeSeparatorTwo: function(object, pspec)
    {
        this.settings.set_boolean("separator-two", object.active);
    },

    changeSeparatorThree: function(object, pspec)
    {
        this.settings.set_boolean("separator-three", object.active);
    },

    changeSeparatorFour: function(object, pspec)
    {
        this.settings.set_boolean("separator-four", object.active);
    },

    changeSeparatorFive: function(object, pspec)
    {
        this.settings.set_boolean("separator-five", object.active);
    },

    changeSeparatorSix: function(object, pspec)
    {
        this.settings.set_boolean("separator-six", object.active);
    },

    changeSeparatorOneBottom: function(object, pspec)
    {
        this.settings.set_boolean("separator-one-bottom", object.active);
    },

    changeSeparatorTwoBottom: function(object, pspec)
    {
        this.settings.set_boolean("separator-two-bottom", object.active);
    },

    changeSeparatorThreeBottom: function(object, pspec)
    {
        this.settings.set_boolean("separator-three-bottom", object.active);
    },

    changeSeparatorFourBottom: function(object, pspec)
    {
        this.settings.set_boolean("separator-four-bottom", object.active);
    },

    changeSeparatorFiveBottom: function(object, pspec)
    {
        this.settings.set_boolean("separator-five-bottom", object.active);
    },

    changeSeparatorSixBottom: function(object, pspec)
    {
        this.settings.set_boolean("separator-six-bottom", object.active);
    },

    changeSeparatorSelection: function(object)
    {
        this.separatorSelection = this.valueSeparator.get_active();
        this.value2SeparatorSize.disconnect(this.valueSeparatorSizeId);
        this.value2SeparatorSizeBottom.disconnect(this.valueSeparatorSizeBottomId);
        this.changeSeparatorSize();
    },

    changeSeparatorSize: function(object)
    {
        if (this.separatorSelection == 0)
        {
            this.value2SeparatorSize.set_value(this.settings.get_int("separator-one-size"));
            this.value2SeparatorSizeBottom.set_value(this.settings.get_int("separator-one-bottom-size"));
            this.valueSeparatorSizeId = this.value2SeparatorSize.connect("value-changed", 
            Lang.bind(this, function()
            {
                if ((this.settings.get_boolean("separator-one")) && (! this.settings.get_boolean("bottom-panel")))
                    this.settings.set_int("separator-one-size", this.value2SeparatorSize.get_value());
                else
                    this.value2SeparatorSize.set_value(this.settings.get_int("separator-one-size"));
            }));
            this.valueSeparatorSizeBottomId = this.value2SeparatorSizeBottom.connect("value-changed", 
            Lang.bind(this, function()
            {
                if ((this.settings.get_boolean("separator-one-bottom")) && (this.settings.get_boolean("bottom-panel")))
                    this.settings.set_int("separator-one-bottom-size", this.value2SeparatorSizeBottom.get_value());
                else
                    this.value2SeparatorSizeBottom.set_value(this.settings.get_int("separator-one-bottom-size"));
            }));
        }
        else if (this.separatorSelection == 1)
        {
            this.value2SeparatorSize.set_value(this.settings.get_int("separator-two-size"));
            this.value2SeparatorSizeBottom.set_value(this.settings.get_int("separator-two-bottom-size"));
            this.valueSeparatorSizeId = this.value2SeparatorSize.connect("value-changed", 
            Lang.bind(this, function()
            {
                if ((this.settings.get_boolean("separator-two")) && (! this.settings.get_boolean("bottom-panel")))
                    this.settings.set_int("separator-two-size", this.value2SeparatorSize.get_value());
                else
                    this.value2SeparatorSize.set_value(this.settings.get_int("separator-two-size"));
            }));
            this.valueSeparatorSizeBottomId = this.value2SeparatorSizeBottom.connect("value-changed", 
            Lang.bind(this, function()
            {
                if ((this.settings.get_boolean("separator-two-bottom")) && (this.settings.get_boolean("bottom-panel")))
                    this.settings.set_int("separator-two-bottom-size", this.value2SeparatorSizeBottom.get_value());
                else
                    this.value2SeparatorSizeBottom.set_value(this.settings.get_int("separator-two-bottom-size"));
            }));
        }
        else if (this.separatorSelection == 2)
        {
            this.value2SeparatorSize.set_value(this.settings.get_int("separator-three-size"));
            this.value2SeparatorSizeBottom.set_value(this.settings.get_int("separator-three-bottom-size"));
            this.valueSeparatorSizeId = this.value2SeparatorSize.connect("value-changed", 
            Lang.bind(this, function()
            {
                if ((this.settings.get_boolean("separator-three")) && (! this.settings.get_boolean("bottom-panel")))
                    this.settings.set_int("separator-three-size", this.value2SeparatorSize.get_value());
                else
                    this.value2SeparatorSize.set_value(this.settings.get_int("separator-three-size"));
            }));
            this.valueSeparatorSizeBottomId = this.value2SeparatorSizeBottom.connect("value-changed", 
            Lang.bind(this, function()
            {
                if ((this.settings.get_boolean("separator-three-bottom")) && (this.settings.get_boolean("bottom-panel")))
                    this.settings.set_int("separator-three-bottom-size", this.value2SeparatorSizeBottom.get_value());
                else
                    this.value2SeparatorSizeBottom.set_value(this.settings.get_int("separator-three-bottom-size"));
            }));
        }
        else if (this.separatorSelection == 3)
        {
            this.value2SeparatorSize.set_value(this.settings.get_int("separator-four-size"));
            this.value2SeparatorSizeBottom.set_value(this.settings.get_int("separator-four-bottom-size"));
            this.valueSeparatorSizeId = this.value2SeparatorSize.connect("value-changed", 
            Lang.bind(this, function()
            {
                if ((this.settings.get_boolean("separator-four")) && (! this.settings.get_boolean("bottom-panel")))
                    this.settings.set_int("separator-four-size", this.value2SeparatorSize.get_value());
                else
                    this.value2SeparatorSize.set_value(this.settings.get_int("separator-four-size"));
            }));
            this.valueSeparatorSizeBottomId = this.value2SeparatorSizeBottom.connect("value-changed", 
            Lang.bind(this, function()
            {
                if ((this.settings.get_boolean("separator-four-bottom")) && (this.settings.get_boolean("bottom-panel")))
                    this.settings.set_int("separator-four-bottom-size", this.value2SeparatorSizeBottom.get_value());
                else
                    this.value2SeparatorSizeBottom.set_value(this.settings.get_int("separator-four-bottom-size"));
            }));
        }
        else if (this.separatorSelection == 4)
        {
            this.value2SeparatorSize.set_value(this.settings.get_int("separator-five-size"));
            this.value2SeparatorSizeBottom.set_value(this.settings.get_int("separator-five-bottom-size"));
            this.valueSeparatorSizeId = this.value2SeparatorSize.connect("value-changed", 
            Lang.bind(this, function()
            {
                if ((this.settings.get_boolean("separator-five")) && (! this.settings.get_boolean("bottom-panel")))
                    this.settings.set_int("separator-five-size", this.value2SeparatorSize.get_value());
                else
                    this.value2SeparatorSize.set_value(this.settings.get_int("separator-five-size"));
            }));
            this.valueSeparatorSizeBottomId = this.value2SeparatorSizeBottom.connect("value-changed", 
            Lang.bind(this, function()
            {
                if ((this.settings.get_boolean("separator-five-bottom")) && (this.settings.get_boolean("bottom-panel")))
                    this.settings.set_int("separator-five-bottom-size", this.value2SeparatorSizeBottom.get_value());
                else
                    this.value2SeparatorSizeBottom.set_value(this.settings.get_int("separator-five-bottom-size"));
            }));
        }
        else if (this.separatorSelection == 5)
        {
            this.value2SeparatorSize.set_value(this.settings.get_int("separator-six-size"));
            this.value2SeparatorSizeBottom.set_value(this.settings.get_int("separator-six-bottom-size"));
            this.valueSeparatorSizeId = this.value2SeparatorSize.connect("value-changed", 
            Lang.bind(this, function()
            {
                if ((this.settings.get_boolean("separator-six")) && (! this.settings.get_boolean("bottom-panel")))
                    this.settings.set_int("separator-six-size", this.value2SeparatorSize.get_value());
                else
                    this.value2SeparatorSize.set_value(this.settings.get_int("separator-six-size"));
            }));
            this.valueSeparatorSizeBottomId = this.value2SeparatorSizeBottom.connect("value-changed", 
            Lang.bind(this, function()
            {
                if ((this.settings.get_boolean("separator-six-bottom")) && (this.settings.get_boolean("bottom-panel")))
                    this.settings.set_int("separator-six-bottom-size", this.value2SeparatorSizeBottom.get_value());
                else
                    this.value2SeparatorSizeBottom.set_value(this.settings.get_int("separator-six-bottom-size"));
            }));
        }
    },

    changeHideActivities: function(object, pspec)
    {
        this.settings.set_boolean("hide-activities", object.active);
    },

    changeDisableHotCorner: function(object, pspec)
    {
        this.settings.set_boolean("disable-hotcorner", object.active);
    },

    changeHideDefaultApplicationMenu: function(object, pspec)
    {
        this.settings.set_boolean("hide-default-application-menu", object.active);
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
        if (this.appearanceSelection == 0)
        {
            if (! this.settings.get_boolean("display-tasks"))
                return;
            this.appearanceName = "position-tasks";
        }
        if (this.appearanceSelection == 1)
        {
            if (! this.settings.get_boolean("display-desktop-button"))
                return;
            this.appearanceName = "position-desktop-button";
        }
        if (this.appearanceSelection == 2)
        {
            if (! this.settings.get_boolean("display-workspace-button"))
                return;
            this.appearanceName = "position-workspace-button";
        }
        if (this.appearanceSelection == 3)
        {
            if (! this.settings.get_boolean("display-showapps-button"))
                return;
            this.appearanceName = "position-appview-button";
        }
        if (this.appearanceSelection == 4)
        {
            if (! this.settings.get_boolean("display-favorites"))
                return;
            this.appearanceName = "position-favorites";
        }
        this.oldValueAppearance = this.settings.get_int(this.appearanceName);
        if (this.oldValueAppearance == 0)
            return;
        else
            this.newValueAppearance = this.oldValueAppearance - 1;
        this.setAppearance();
    },

    changeAppearanceRight: function()
    {
        this.appearanceSelection = this.settings.get_enum("appearance-selection");
        if (this.appearanceSelection == 0)
        {
            if (! this.settings.get_boolean("display-tasks"))
                return;
            this.appearanceName = "position-tasks";
        }
        if (this.appearanceSelection == 1)
        {
            if (! this.settings.get_boolean("display-desktop-button"))
                return;
            this.appearanceName = "position-desktop-button";
        }
        if (this.appearanceSelection == 2)
        {
            if (! this.settings.get_boolean("display-workspace-button"))
                return;
            this.appearanceName = "position-workspace-button";
        }
        if (this.appearanceSelection == 3)
        {
            if (! this.settings.get_boolean("display-showapps-button"))
                return;
            this.appearanceName = "position-appview-button";
        }
        if (this.appearanceSelection == 4)
        {
            if (! this.settings.get_boolean("display-favorites"))
                return;
            this.appearanceName = "position-favorites";
        }
        this.oldValueAppearance = this.settings.get_int(this.appearanceName);
        if (this.oldValueAppearance == 4)
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
                if (this.intAppearance == this.newValueAppearance)
                    this.resetAppearance = appearance;
            },
            this
        );
        this.settings.set_int(this.appearanceName, this.newValueAppearance);
        this.settings.set_int(this.resetAppearance, this.oldValueAppearance);
    },

    reset: function()
    {
        this.valueDisplayTasks.set_active(true);
        this.valueDisplayDesktopButton.set_active(true);
        this.valueDisplayWorkspaceButton.set_active(true);
        this.valueDisplayShowAppsButton.set_active(true);
        this.valueDisplayFavorites.set_active(false);
        this.settings.set_int("panel-position", 1);
        this.settings.set_int("panel-box", 1);
        this.settings.set_int("position-max-right", 9);
        this.valueBottomPanel.set_active(false);
        this.valueBottomPanelVertical.set_value(0);        
        this.valueIconSize.set_value(22);
        this.valueIconSizeBottom.set_value(22);
        this.valueFontSize.set_value(16);
        this.valueFontSizeBottom.set_value(16);
        this.valueAllWorkspaces.set_active(false);
        this.valueCloseButton.set_active(0);
        this.valueActiveTaskFrame.set_active(true);
        let color = RESETCOLOR;
        let rgba = new Gdk.RGBA();
        rgba.parse(color);
        this.valueActiveTaskBackgroundColor.set_rgba(rgba);
        this.settings.set_string("active-task-background-color", RESETCOLOR);
        this.value2ActiveTaskBackgroundColor.set_active(false);
        this.valueHoverSwitchTask.set_active(false);
        this.valueHoverDelay.set_value(350);
        this.valueDesktopButtonRightClick.set_active(true);
        this.valueWorkspaceButtonIndex.set_active(0);
        this.valueShowAppsButtonToggle.set_active(0);
        this.valueHideActivities.set_active(false);
        this.valueDisableHotCorner.set_active(false);
        this.valueHideDefaultApplicationMenu.set_active(false);
        this.valueDisplayLabel.set_active(true);
        this.valueDisplayThumbnail.set_active(true);
        this.valueDisplayFavoritesLabel.set_active(true);
        this.valuePreviewSize.set_value(350);
        this.valuePreviewDelay.set_value(500);
        this.settings.set_int("position-tasks", 4);
        this.settings.set_int("position-desktop-button", 3);
        this.settings.set_int("position-workspace-button", 2);
        this.settings.set_int("position-appview-button", 1);
        this.settings.set_int("position-favorites", 0);
    }
}
