#!/bin/bash
#  GNOME Shell Extension TaskBar
#  Copyright (C) 2013-2017 zpydr
#
#  Version 56
#
#  This program is free software: you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation, either version 3 of the License, or
#  (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with this program.  If not, see <https:#www.gnu.org/licenses/>.
#
#  zpydr@openmailbox.org
#
dconf dump /org/gnome/shell/extensions/TaskBar/ >$HOME/taskbar.dconf
if [ ! -f $HOME/taskbar.dconf ]; then
    zenity --info --text 'Export of TaskBar Settings Failed!'
else
    zenity --info --text 'Export of TaskBar Settings Successful!'
fi
