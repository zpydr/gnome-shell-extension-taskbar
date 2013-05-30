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
    return prefs.scrollWindowPrefs();
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
        this.buildPrefsWidget();
    },

    buildPrefsWidget: function()
    {
        this.grid = new Gtk.Grid();
        this.grid.margin = this.grid.row_spacing = 10;
        this.grid.column_spacing = 5;
        
        this.newValueAppearance = null;
        this.oldValueAppearance = null;

        let labelComponents = new Gtk.Label({ label: "\n<b>Components</b>", use_markup: true, xalign: 0});
        this.grid.attach(labelComponents, 1, 0, 1, 1);

        let labelDisplayTasks = new Gtk.Label({label: "Show Tasks", xalign: 0});
        this.grid.attach(labelDisplayTasks, 1, 1, 1, 1);
        let valueDisplayTasks = new Gtk.Switch({active: this.settings.get_boolean("display-tasks")});
        valueDisplayTasks.connect('notify::active', Lang.bind(this, this.changeDisplayTasks));
        this.grid.attach(valueDisplayTasks, 4, 1, 2, 1);

        let labelDisplayDesktopButton = new Gtk.Label({label: "Show Desktop Button", xalign: 0});
        this.grid.attach(labelDisplayDesktopButton, 1, 2, 1, 1);
        let valueDisplayDesktopButton = new Gtk.Switch({active: this.settings.get_boolean("display-desktop-button")});
        valueDisplayDesktopButton.connect('notify::active', Lang.bind(this, this.changeDisplayDesktopButton));
        this.grid.attach(valueDisplayDesktopButton, 4, 2, 2, 1);

        let labelDisplayWorkspaceButton = new Gtk.Label({label: "Show Workspace Button", xalign: 0});
        this.grid.attach(labelDisplayWorkspaceButton, 1, 3, 1, 1);
        let valueDisplayWorkspaceButton = new Gtk.Switch({active: this.settings.get_boolean("display-workspace-button")});
        valueDisplayWorkspaceButton.connect('notify::active', Lang.bind(this, this.changeDisplayWorkspaceButton));
        this.grid.attach(valueDisplayWorkspaceButton, 4, 3, 2, 1);

        let labelDisplayShowAppsButton = new Gtk.Label({label: "Show Apps/Overview Button", xalign: 0});
        this.grid.attach(labelDisplayShowAppsButton, 1, 4, 1, 1);
        let valueDisplayShowAppsButton = new Gtk.Switch({active: this.settings.get_boolean("display-showapps-button")});
        valueDisplayShowAppsButton.connect('notify::active', Lang.bind(this, this.changeDisplayShowAppsButton));
        this.grid.attach(valueDisplayShowAppsButton, 4, 4, 2, 1);

        let labelDisplayFavorites = new Gtk.Label({label: "Show Favorites", xalign: 0});
        this.grid.attach(labelDisplayFavorites, 1, 5, 1, 1);
        let valueDisplayFavorites = new Gtk.Switch({active: this.settings.get_boolean("display-favorites")});
        valueDisplayFavorites.connect('notify::active', Lang.bind(this, this.changeDisplayFavorites));
        this.grid.attach(valueDisplayFavorites, 4, 5, 2, 1);

        let labelAdjustments = new Gtk.Label({ label: "\n<b>Adjustments</b>", use_markup: true, xalign: 0});
        this.grid.attach(labelAdjustments, 1, 6, 1, 1);

        let labelPanelPosition = new Gtk.Label({label: "Align Position", xalign: 0});
        this.grid.attach(labelPanelPosition, 1, 7, 1, 1);
        let valuePanelPosition = new Gtk.Button({image: new Gtk.Image({icon_name: 'back'})});
        let value2PanelPosition = new Gtk.Button({image: new Gtk.Image({icon_name: 'forward'})});
        valuePanelPosition.connect('clicked', Lang.bind(this, this.changePanelPositionLeft));
        value2PanelPosition.connect('clicked', Lang.bind(this, this.changePanelPositionRight));
        this.grid.attach(valuePanelPosition, 4, 7, 1, 1);
        this.grid.attach(value2PanelPosition, 5, 7, 1, 1);

        let labelIconSize = new Gtk.Label({label: "Icon Size [22]", xalign: 0});
        this.grid.attach(labelIconSize, 1, 8, 1, 1);
        let valueIconSize = new Gtk.Adjustment({lower: 1, upper: 96, step_increment: 1});
        let value2IconSize = new Gtk.SpinButton({adjustment: valueIconSize, snap_to_ticks: true});
        value2IconSize.set_value(this.settings.get_int("icon-size"));
        value2IconSize.connect("value-changed", Lang.bind(this, this.changeIconSize, valueIconSize));
        this.grid.attach(value2IconSize, 3, 8, 3, 1);

        let labelCloseButton = new Gtk.Label({label: "Close Tasks", xalign: 0});
        this.grid.attach(labelCloseButton, 1, 9, 1, 1);
        let valueCloseButton = new Gtk.ComboBoxText();
        valueCloseButton.append_text("OFF");
        valueCloseButton.append_text("Middle Click");
        valueCloseButton.append_text("Right Click");
        valueCloseButton.set_active(this.settings.get_enum("close-button"));
        valueCloseButton.connect('changed', Lang.bind(this, this.changeCloseButton, valueCloseButton));
        this.grid.attach(valueCloseButton, 3, 9, 3, 1);

        let labelDesktopButtonIcon = new Gtk.Label({label: "Desktop Button Icon", xalign: 0});
        this.grid.attach(labelDesktopButtonIcon, 1, 10, 1, 1);
        let valueDesktopButtonIcon = new Gtk.ComboBoxText();
        valueDesktopButtonIcon.append_text("Default");
        valueDesktopButtonIcon.append_text("GNOME");
        valueDesktopButtonIcon.append_text("Dark");
        valueDesktopButtonIcon.set_active(this.settings.get_enum("desktop-button-icon"));
        valueDesktopButtonIcon.connect('changed', Lang.bind(this, this.changeDesktopButtonIcon, valueDesktopButtonIcon));
        this.grid.attach(valueDesktopButtonIcon, 3, 10, 3, 1);

        let labelDesktopButtonRightClick = new Gtk.Label({label: "Desktop Button Right Click\nopens Preferences (this)", xalign: 0});
        this.grid.attach(labelDesktopButtonRightClick, 1, 11, 1, 1);
        let valueDesktopButtonRightClick = new Gtk.Switch({active: this.settings.get_boolean("desktop-button-right-click")});
        valueDesktopButtonRightClick.connect('notify::active', Lang.bind(this, this.changeDesktopButtonRightClick));
        this.grid.attach(valueDesktopButtonRightClick, 4, 11, 2, 1);

        let labelWorkspaceButtonIndex = new Gtk.Label({label: "Workspace Button Index", xalign: 0});
        this.grid.attach(labelWorkspaceButtonIndex, 1, 12, 1, 1);
        let valueWorkspaceButtonIndex = new Gtk.ComboBoxText();
        valueWorkspaceButtonIndex.append_text("Index");
        valueWorkspaceButtonIndex.append_text("Index/Total");
        valueWorkspaceButtonIndex.set_active(this.settings.get_enum("workspace-button-index"));
        valueWorkspaceButtonIndex.connect('changed', Lang.bind(this, this.changeWorkspaceButtonIndex, valueWorkspaceButtonIndex));
        this.grid.attach(valueWorkspaceButtonIndex, 3, 12, 3, 1);

        let labelShowAppsButtonToggle = new Gtk.Label({label: "Show Apps/Overview\nButton L/R Click Toggle", xalign: 0});
        this.grid.attach(labelShowAppsButtonToggle, 1, 13, 1, 1);
        let valueShowAppsButtonToggle = new Gtk.ComboBoxText();
        valueShowAppsButtonToggle.append_text("L Appview\nR Overview");
        valueShowAppsButtonToggle.append_text("L Overview\nR Appview");
        valueShowAppsButtonToggle.set_active(this.settings.get_enum("showapps-button-toggle"));
        valueShowAppsButtonToggle.connect('changed', Lang.bind(this, this.changeShowAppsButtonToggle, valueShowAppsButtonToggle));
        this.grid.attach(valueShowAppsButtonToggle, 3, 13, 3, 1);

        let labelHideActivities = new Gtk.Label({label: "Hide Activities *", xalign: 0});
        this.grid.attach(labelHideActivities, 1, 14, 1, 1);
        let valueHideActivities = new Gtk.Switch({active: this.settings.get_boolean("hide-activities")});
        valueHideActivities.connect('notify::active', Lang.bind(this, this.changeHideActivities));
        this.grid.attach(valueHideActivities, 4, 14, 2, 1);

        let labelDisableHotCorner = new Gtk.Label({label: "Disable Hot Corner *", xalign: 0});
        this.grid.attach(labelDisableHotCorner, 1, 15, 1, 1);
        let valueDisableHotCorner = new Gtk.Switch({active: this.settings.get_boolean("disable-hotcorner")});
        valueDisableHotCorner.connect('notify::active', Lang.bind(this, this.changeDisableHotCorner));
        this.grid.attach(valueDisableHotCorner, 4, 15, 2, 1);

        let labelHideDefaultApplicationMenu = new Gtk.Label({label: "Hide Default App Menu *", xalign: 0});
        this.grid.attach(labelHideDefaultApplicationMenu, 1, 16, 1, 1);
        let valueHideDefaultApplicationMenu = new Gtk.Switch({active: this.settings.get_boolean("hide-default-application-menu")});
        valueHideDefaultApplicationMenu.connect('notify::active', Lang.bind(this, this.changeHideDefaultApplicationMenu));
        this.grid.attach(valueHideDefaultApplicationMenu, 4, 16, 2, 1);

        let labelWarning = new Gtk.Label({ label: "* Possible conflict\nwith other extensions", use_markup: true, xalign: 0 });
        this.grid.attach(labelWarning, 1, 17, 1, 1);

        let labelPreview = new Gtk.Label({ label: "\n<b>Preview</b>", use_markup: true, xalign: 0 });
        this.grid.attach(labelPreview, 1, 18, 1, 1);

        let labelDisplayLabel = new Gtk.Label({label: "Show Tasks Label", xalign: 0});
        this.grid.attach(labelDisplayLabel, 1, 19, 1, 1);
        let valueDisplayLabel = new Gtk.Switch({active: this.settings.get_boolean("display-label")});
        valueDisplayLabel.connect('notify::active', Lang.bind(this, this.changeDisplayLabel));
        this.grid.attach(valueDisplayLabel, 4, 19, 2, 1);

        let labelDisplayThumbnail = new Gtk.Label({label: "Show Tasks Thumbnail", xalign: 0});
        this.grid.attach(labelDisplayThumbnail, 1, 20, 1, 1);
        let valueDisplayThumbnail = new Gtk.Switch({active: this.settings.get_boolean("display-thumbnail")});
        valueDisplayThumbnail.connect('notify::active', Lang.bind(this, this.changeDisplayThumbnail));
        this.grid.attach(valueDisplayThumbnail, 4, 20, 2, 1);

        let labelDisplayFavoritesLabel = new Gtk.Label({label: "Show Favorites Label", xalign: 0});
        this.grid.attach(labelDisplayFavoritesLabel, 1, 21, 1, 1);
        let valueDisplayFavoritesLabel = new Gtk.Switch({active: this.settings.get_boolean("display-favorites-label")});
        valueDisplayFavoritesLabel.connect('notify::active', Lang.bind(this, this.changeDisplayFavoritesLabel));
        this.grid.attach(valueDisplayFavoritesLabel, 4, 21, 2, 1);

        let labelPreviewSize = new Gtk.Label({label: "Thumbnail Size [350]", xalign: 0});
        this.grid.attach(labelPreviewSize, 1, 22, 1, 1);
        let valuePreviewSize = new Gtk.Adjustment({lower: 100, upper: 1000, step_increment: 50});
        let value2PreviewSize = new Gtk.SpinButton({adjustment: valuePreviewSize, snap_to_ticks: true});
        value2PreviewSize.set_value(this.settings.get_int("preview-size"));
        value2PreviewSize.connect("value-changed", Lang.bind(this, this.changePreviewSize, valuePreviewSize));
        this.grid.attach(value2PreviewSize, 3, 22, 3, 1);
        this.ts = value2PreviewSize;

        let labelPreviewDelay = new Gtk.Label({label: "Preview Delay [500] (ms)", xalign: 0});
        this.grid.attach(labelPreviewDelay, 1, 23, 2, 1);
        let valuePreviewDelay = new Gtk.Adjustment({lower: 0, upper: 3000, step_increment: 250});
        let value2PreviewDelay = new Gtk.SpinButton({adjustment: valuePreviewDelay, snap_to_ticks: true});
        value2PreviewDelay.set_value(this.settings.get_int("preview-delay"));
        value2PreviewDelay.connect("value-changed", Lang.bind(this, this.changePreviewDelay, valuePreviewDelay));
        this.grid.attach(value2PreviewDelay, 3, 23, 3, 1);

        let labelAppearance = new Gtk.Label({ label: "\n<b>Appearance</b>", use_markup: true, xalign: 0 });
        this.grid.attach(labelAppearance, 1, 24, 1, 1);

        let labelLeftToRight = new Gtk.Label({ label: "From Left to Right", use_markup: true, xalign: 0 });
        this.grid.attach(labelLeftToRight, 1, 25, 1, 1);

        this.valueAppearanceOne = new Gtk.ComboBoxText();
        this.valueAppearanceOne.append_text("Tasks");
        this.valueAppearanceOne.append_text("Desktop Button");
        this.valueAppearanceOne.append_text("Workspace Button");
        this.valueAppearanceOne.append_text("Show Apps Button");
        this.valueAppearanceOne.append_text("Favorites");
        this.valueAppearanceOne.set_active(this.settings.get_enum("appearance-one"));
        this.valueAppearanceOne.connect('changed', Lang.bind(this, this.changeAppearanceOne));
        this.grid.attach(this.valueAppearanceOne, 1, 26, 1, 1);

        this.valueAppearanceTwo = new Gtk.ComboBoxText();
        this.valueAppearanceTwo.append_text("Tasks");
        this.valueAppearanceTwo.append_text("Desktop Button");
        this.valueAppearanceTwo.append_text("Workspace Button");
        this.valueAppearanceTwo.append_text("Show Apps Button");
        this.valueAppearanceTwo.append_text("Favorites");
        this.valueAppearanceTwo.set_active(this.settings.get_enum("appearance-two"));
        this.valueAppearanceTwo.connect('changed', Lang.bind(this, this.changeAppearanceTwo));
        this.grid.attach(this.valueAppearanceTwo, 1, 27, 1, 1);

        this.valueAppearanceThree = new Gtk.ComboBoxText();
        this.valueAppearanceThree.append_text("Tasks");
        this.valueAppearanceThree.append_text("Desktop Button");
        this.valueAppearanceThree.append_text("Workspace Button");
        this.valueAppearanceThree.append_text("Show Apps Button");
        this.valueAppearanceThree.append_text("Favorites");
        this.valueAppearanceThree.set_active(this.settings.get_enum("appearance-three"));
        this.valueAppearanceThree.connect('changed', Lang.bind(this, this.changeAppearanceThree));
        this.grid.attach(this.valueAppearanceThree, 1, 28, 1, 1);

        this.valueAppearanceFour = new Gtk.ComboBoxText();
        this.valueAppearanceFour.append_text("Tasks");
        this.valueAppearanceFour.append_text("Desktop Button");
        this.valueAppearanceFour.append_text("Workspace Button");
        this.valueAppearanceFour.append_text("Show Apps Button");
        this.valueAppearanceFour.append_text("Favorites");
        this.valueAppearanceFour.set_active(this.settings.get_enum("appearance-four"));
        this.valueAppearanceFour.connect('changed', Lang.bind(this, this.changeAppearanceFour));
        this.grid.attach(this.valueAppearanceFour, 1, 29, 1, 1);

        this.valueAppearanceFive = new Gtk.ComboBoxText();
        this.valueAppearanceFive.append_text("Tasks");
        this.valueAppearanceFive.append_text("Desktop Button");
        this.valueAppearanceFive.append_text("Workspace Button");
        this.valueAppearanceFive.append_text("Show Apps Button");
        this.valueAppearanceFive.append_text("Favorites");
        this.valueAppearanceFive.set_active(this.settings.get_enum("appearance-five"));
        this.valueAppearanceFive.connect('changed', Lang.bind(this, this.changeAppearanceFive));
        this.grid.attach(this.valueAppearanceFive, 1, 30, 1, 1);

        let labelSpace1 = new Gtk.Label({label: "\t", xalign: 0});
        this.grid.attach(labelSpace1, 0, 1, 1, 1);
        let labelSpace2 = new Gtk.Label({label: "\t", xalign: 0,  hexpand: true});
        this.grid.attach(labelSpace2, 2, 1, 1, 1);
        let labelSpace3 = new Gtk.Label({label: "\t", xalign: 0});
        this.grid.attach(labelSpace3, 3, 1, 1, 1);
        let labelSpace4 = new Gtk.Label({label: "\t", xalign: 0});
        this.grid.attach(labelSpace4, 6, 1, 1, 1);
        let labelSpace5 = new Gtk.Label({label: "\t", xalign: 0});
        this.grid.attach(labelSpace5, 0, 31, 1, 1);
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

    changePanelPositionLeft: function()
    {
        let panelPosition = this.settings.get_int("panel-position");
        let panelBox = this.settings.get_int("panel-box");
        let positionMaxRight = this.settings.get_int("position-max-right");
        if (panelPosition == 0)
        {
            if (panelBox > 1)
            {
                this.signalMax = this.settings.connect("changed::position-max-right", Lang.bind(this, function()
                {
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
        if (panelPosition >= positionMaxRight)
        {
            if (panelBox < 3)
            {
                this.settings.set_int("panel-box", panelBox + 1);
                this.settings.set_int("panel-position", 0);
            }
            else
                this.settings.set_int("panel-position", positionMaxRight);
        }
        else
            this.settings.set_int("panel-position", panelPosition + 1);
    },

    changeIconSize: function(object, valueIconSize)
    {
        this.settings.set_int("icon-size", valueIconSize.get_value());
    },

    changeCloseButton: function(object, valueCloseButton)
    {
        this.settings.set_enum("close-button", valueCloseButton.get_active());
    },

    changeDesktopButtonIcon: function(object, valueDesktopButtonIcon)
    {
        this.settings.set_enum("desktop-button-icon", valueDesktopButtonIcon.get_active());
    },

    changeDesktopButtonRightClick: function(object, pspec)
    {
        this.settings.set_boolean("desktop-button-right-click", object.active);
    },

    changeWorkspaceButtonIndex: function(object, valueWorkspaceButtonIndex)
    {
        this.settings.set_enum("workspace-button-index", valueWorkspaceButtonIndex.get_active());
    },

    changeShowAppsButtonToggle: function(object, valueShowAppsButtonToggle)
    {
        this.settings.set_enum("showapps-button-toggle", valueShowAppsButtonToggle.get_active());
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

    changePreviewSize: function(object, valuePreviewSize)
    {
        this.settings.set_int("preview-size", valuePreviewSize.get_value());
    },

    changePreviewDelay: function(object, valuePreviewDelay)
    {
        this.settings.set_int("preview-delay", valuePreviewDelay.get_value());
    },

    changeAppearanceOne: function(object)
    {
        this.oldValueAppearance = this.settings.get_enum("appearance-one");
        this.newValueAppearance = this.valueAppearanceOne.get_active();
        this.switchAppearance();
        this.settings.set_enum("appearance-one", this.valueAppearanceOne.get_active());
        this.setActive();
    },

    changeAppearanceTwo: function(object)
    {
        this.oldValueAppearance = this.settings.get_enum("appearance-two");
        this.newValueAppearance = this.valueAppearanceTwo.get_active();
        this.switchAppearance();
        this.settings.set_enum("appearance-two", this.valueAppearanceTwo.get_active());
        this.setActive();
    },

    changeAppearanceThree: function(object)
    {
        this.oldValueAppearance = this.settings.get_enum("appearance-three");
        this.newValueAppearance = this.valueAppearanceThree.get_active();
        this.switchAppearance();
        this.settings.set_enum("appearance-three", this.valueAppearanceThree.get_active());
        this.setActive();
    },

    changeAppearanceFour: function(object)
    {
        this.oldValueAppearance = this.settings.get_enum("appearance-four");
        this.newValueAppearance = this.valueAppearanceFour.get_active();
        this.switchAppearance();
        this.settings.set_enum("appearance-four", this.valueAppearanceFour.get_active());
        this.setActive();
    },

    changeAppearanceFive: function(object)
    {
        this.oldValueAppearance = this.settings.get_enum("appearance-five");
        this.newValueAppearance = this.valueAppearanceFive.get_active();
        this.switchAppearance();
        this.settings.set_enum("appearance-five", this.valueAppearanceFive.get_active());
        this.setActive();
    },

    switchAppearance: function()
    {
        this.appearances =
        [
            ("appearance-one"),
            ("appearance-two"),
            ("appearance-three"),
            ("appearance-four"),
            ("appearance-five")
        ];
        this.appearances.forEach(
            function(appearance)
            {
                if (this.newValueAppearance == (this.settings.get_enum(appearance)))
                    this.settings.set_enum(appearance, this.oldValueAppearance);
            },
            this
        );
    },

    setActive: function()
    {
        this.valueAppearanceOne.set_active(this.settings.get_enum("appearance-one"));
        this.valueAppearanceTwo.set_active(this.settings.get_enum("appearance-two"));
        this.valueAppearanceThree.set_active(this.settings.get_enum("appearance-three"));
        this.valueAppearanceFour.set_active(this.settings.get_enum("appearance-four"));
        this.valueAppearanceFive.set_active(this.settings.get_enum("appearance-five"));
    },

    scrollWindowPrefs: function()
    {
        let scrollWindow = new Gtk.ScrolledWindow(
        {
            'hscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
            'vscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
            'hexpand': true, 'vexpand': true
        });
        scrollWindow.add_with_viewport(this.grid);
        scrollWindow.show_all();
        return scrollWindow;
    }
}
