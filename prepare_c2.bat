rem prepares a c2 install for use in this game
rem must clean out all conflicting stuff and link in this game's stuff instead

setlocal

set C2DIR="C:\Program Files\Construct 2"
set SRCDIR="%CD%"\extensions

copy /y %SRCDIR%\effects\*.* %C2DIR%\Effects

call :DO_ONE nopewebkit

goto :EOF

:DO_ONE

rd /s /q %C2DIR%\exporters\html5\plugins\%1
mklink /d %C2DIR%\exporters\html5\plugins\%1 %SRCDIR%\exporters\html5\plugins\%1
exit /b

:EOF