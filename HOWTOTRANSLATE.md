# How to Translate

## Update the `TaskBar.pot` file

Update the `TaskBar.pot` file (i.e. template for translations) from the
   current sources:
```bash
cd .../gnome-shell-extension-taskbar.git
xgettext --join-existing -k_ -kN_ -o TaskBar.pot *.js
```
  All the translatable string in the `*.js` files, i.e. function calls
with string parameters such as
```
   _("String to translate")
```
  should be found and included in the POT file for translation.

  Unfortunately, the POT file copyright headers are replaced with a
default ones. It can be easily fixed with Git interactive staging:

```bash
$ git add TaskBar.pot
$ git gui
# Staged Changes (Will Commit) | TaskBar.pot | <right click on header diff> | Unstage Hunk From Commit
$ git checkout -- TaskBar.pot
```

Now we have the update `TaskBar.pot` file in both working directory and Git staging area.

## Create new language

Create new language from the template:

```bash
$ mkdir -p locale/cs_CZ/LC_MESSAGES/
$ LANG=cs_CZ msginit
$ mv -iv cs.po locale/cs_CZ/LC_MESSAGES/TaskBar.po
```

The language code consist of [language](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) and optional
[region](https://en.wikipedia.org/wiki/ISO_3166-2) code (Czech language
[cs] in the Czech Republic [CZ] in this case).

## Translate
For translating we can use GUI program POedit. Qt Linguist is another
alternative.

```bash
$ poedit locale/cs_CZ/LC_MESSAGES/TaskBar.po
```
   or
```bash
$ linguist locale/cs_CZ/LC_MESSAGES/TaskBar.po
```

The PO file contains links to the `*.js` files. As the PO file was
moved to the `.../LC_MESSAGES/` subdirectory, the GUI translation tools
are unable to show preview of the source code context. I believe it is
not possible to change the `*.js` files paths in the PO file to keep it
usable for the GNOME extensions system so the only alternative is to
translate the PO file before moving if the source code preview is
necessary. On the other hand, I do not think the source code preview is
necessary in such a small piece of software with straightforward
text mapping. Moreover, POedit allows to define relative path to the
sourcode:
```
  Catalogue | Properties... | Source paths | Base path: ../../.. | Ok
```

Then you can right click on the translation string and select
References: to the source code.

In menu
```
  Catalogue | Properties...
```
you can easily fill in other translation parameters (such as encoding,
translator's e-mail address etc.).

## Update PO file
Update PO translation file according to the current POT file:

  * On command line:

    ```bash
    $ msgmerge -U locale/cs_CZ/LC_MESSAGES/TaskBar.po TaskBar.pot
    ```

  * POedit:
	```
    Catalogue | Update from POT File...
	```
    
The GUI translation tool automatically generates MO binary
representations of the translation when PO file is saved. So running
```bash
$ msgfmt locale/cs_CZ/LC_MESSAGES/TaskBar.po -o locale/cs_CZ/LC_MESSAGES/TaskBar.mo
```
on the command line is not necessary.
