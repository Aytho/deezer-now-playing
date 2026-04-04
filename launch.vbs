Set WshShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

scriptDir = objFSO.GetParentFolderName(WScript.ScriptFullName)

WshShell.Run "cmd /c cd /d """ & scriptDir & "\player"" && npm install && npm start", 0, False