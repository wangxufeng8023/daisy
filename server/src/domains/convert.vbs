' 
' @file convert.vbs 转换 Word 文档为 pdf 格式的 VB 脚本。
' @author ruoshui_engr@163.com (Angela-1)
' 本文件是雏菊-学校内务检查管理系统的一部分。
' 
' © 2017-2018 Angela 版权所有。代码开源仅用于学术交流分享，商业使用请联系作者。
' 

Set args = WScript.Arguments

' For x = 0 to args.Count - 1  
'       msgbox args(x)  
' Next  

src_file_path = args(0) ' 第一参数为源文件绝对路径

pathArray = split(src_file_path, ".")
result_file_path = pathArray(0) + ".pdf"

' path = createobject("Scripting.FileSystemObject").GetFile(Wscript.ScriptFullName).ParentFolder.Path 
Set word = CreateObject("Word.application") 
Set docx = word.Documents.Open(src_file_path) 
docx.SaveAs result_file_path, 17 
docx.close(doNotSaveChanges) 
word.Quit 
Set docx = nothing 
Set word = nothing