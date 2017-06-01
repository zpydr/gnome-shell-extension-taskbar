#!/bin/bash
if [ ! -f $HOME/taskbar.dconf ]; then
    zenity --info --text 'Import of TaskBar Settings Failed!'
else
    dconf load /org/gnome/shell/extensions/TaskBar/ <$HOME/taskbar.dconf
    zenity --info --text 'Import of TaskBar Settings Successful!'
fi
