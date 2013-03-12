//Code taken from 
//https://extensions.gnome.org/extension/368/taskbar-with-desktop-button-to-minimizeunminimize-/ 
//by Xes http://svn.xesnet.fr/gnomeextensions

const Gio = imports.gi.Gio;
const Extension = imports.misc.extensionUtils.getCurrentExtension();

function Settings(schema)
{
    this.init(schema);
}

Settings.prototype =
{
    schema: null,

    init: function(schema)
    {
	this.schema = schema;
    },

    getSettings: function()
    {
	const GioSSS = Gio.SettingsSchemaSource;

	let schemaDir = Extension.dir.get_child('schemas');
	let schemaSource;
	if (schemaDir.query_exists(null))
            schemaSource = GioSSS.new_from_directory(schemaDir.get_path(), GioSSS.get_default(), false);
	else
            schemaSource = GioSSS.get_default();

	let schemaObj = schemaSource.lookup(this.schema, true);
	if (! schemaObj)
            throw new Error('Schema ' + this.schema + ' could not be found for extension ' + Extension.metadata.uuid + '. Please check your installation.');

	return new Gio.Settings({settings_schema: schemaObj})
    }
}
