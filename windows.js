//Code taken from 
//https://extensions.gnome.org/extension/368/taskbar-with-desktop-button-to-minimizeunminimize-/ 
//by Xes http://svn.xesnet.fr/gnomeextensions

const Lang = imports.lang;

function Windows(callBackThis, callbackWindowsListChanged, callbackWindowChanged)
{
    this.init(callBackThis, callbackWindowsListChanged, callbackWindowChanged);
}

Windows.prototype =
{
    workspace: null,
    windowsList: new Array(),

    callBackThis: null,
    callbackWindowsListChanged: null,
    callbackWindowChanged: null,

    workspaceSwitchSignal: null,
    windowAddedSignal: null,
    windowRemovedSignal: null,
    windowsSignals: new Array(),

    init: function(callBackThis, callbackWindowsListChanged, callbackWindowChanged)
    {
	//Set User Callback
	this.callBackThis = callBackThis;
	this.callbackWindowsListChanged = callbackWindowsListChanged;
	this.callbackWindowChanged = callbackWindowChanged;

	//Init WindowsList
	this.onWorkspaceChanged();

	//Add window manager signals
	this.workspaceSwitchSignal = global.window_manager.connect('switch-workspace', Lang.bind(this, this.onWorkspaceChanged));
    },

    destruct: function()
    {
	//Remove window manager signals
	global.window_manager.disconnect(this.workspaceSwitchSignal);

	//Remove workspace signals
	this.workspace.disconnect(this.windowAddedSignal);
	this.workspace.disconnect(this.windowRemovedSignal);

	//Clean windows list
	this.cleanWindowsList();
    },

    onWorkspaceChanged: function()
    {
	//Remove workspace signals if necessary
	if (this.windowAddedSignal != null)
	    this.workspace.disconnect(this.windowAddedSignal);
	if (this.windowRemovedSignal != null)
	    this.workspace.disconnect(this.windowRemovedSignal);

	//Clean windows list
	this.cleanWindowsList();

	//Get current workspace
	for (let i = 0; i < global.screen.n_workspaces - 1; i++)
	{
		this.workspace = global.screen.get_workspace_by_index(i);

		//Build windows list
		this.workspace.list_windows().forEach(
		    function(window)
		    {
			this.addWindowInList(window);
		    },
		    this
		);
	}

	//Call User Callback
	this.callbackWindowsListChanged.call(this.callBackThis, this.windowsList, 0, null);

	//Add workspace signals
	for (let i = 0; i < global.screen.n_workspaces; i++) {
		this.workspace = global.screen.get_workspace_by_index(i);
		this.windowAddedSignal = this.workspace.connect_after('window-added', Lang.bind(this, this.onWindowAdded));
		this.windowRemovedSignal = this.workspace.connect_after('window-removed', Lang.bind(this, this.onWindowRemoved));
	}
    },

    onWindowChanged: function(window, object, type)
    {
	if (type == 0) //Focus changed
	{
	    if (window.appears_focused)
		this.callbackWindowChanged.call(this.callBackThis, window, 0);
	}
	else if (type == 1) //Title changed
	    this.callbackWindowChanged.call(this.callBackThis, window, 1);
    },

    onWindowAdded: function(workspace, window)
    {
	if (this.addWindowInList(window))
	    this.callbackWindowsListChanged.call(this.callBackThis, this.windowsList, 1, window);
    },

    onWindowRemoved: function(workspace, window)
    {
	if (this.removeWindowInList(window))
	    this.callbackWindowsListChanged.call(this.callBackThis, this.windowsList, 2, window);
    },

    searchWindowInList: function(window)
    {
	let index = null;

	for (let indexWindow in this.windowsList)
	{
	    if (this.windowsList[indexWindow] == window)
	    {
		index = indexWindow;
		break;
	    }
	}

	return index;
    },
    
    addWindowInList: function(window)
    {
	let index = this.searchWindowInList(window);

	if (index == null && ! window.is_skip_taskbar())
	{
	    this.windowsList.push(window);

	    //Add window signals
	    let objectAndSignals = [
		window,
		[
		    window.connect('notify::appears-focused', Lang.bind(this, this.onWindowChanged, 0)),
		    window.connect('notify::title', Lang.bind(this, this.onWindowChanged, 1))
		]
	    ];
	    this.windowsSignals.push(objectAndSignals);

	    return true;
	}
	else
	    return false;
    },

    removeWindowInList: function(window)
    {
	let index = this.searchWindowInList(window);
	
	if (index != null)
	{
	    this.windowsList.splice(index, 1);

	    //Remove window signals
	    for (let indexSignal in this.windowsSignals)
	    {
		let [object, signals] = this.windowsSignals[indexSignal];

		if (object == window)
		{
		    signals.forEach(
			function(signal)
			{
			    object.disconnect(signal);
			},
			this
		    );

		    this.windowsSignals.splice(indexSignal, 1);

		    break;
		}
	    }

	    return true;
	}
	else
	    return false;
    },

    cleanWindowsList: function()
    {
	for (let i = this.windowsList.length -1 ; i>=0 ; i--)
	    this.removeWindowInList(this.windowsList[i]);
    }
}
