#!/bin/bash
#  GNOME Shell Extension TaskBar 2020
#  Copyright (C) 2013-2018 zpydr
#  Copyright (C) 2020 c0ldplasma
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
#
dconf dump /org/gnome/shell/extensions/TaskBar/ >$HOME/taskbar.dconf
if [ ! -f $HOME/taskbar.dconf ]; then
    zenity --info --text 'Export of TaskBar 2020 Settings Failed!'
else
    zenity --info --text 'Export of TaskBar 2020 Settings Successful!'
fi
