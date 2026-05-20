
using Autodesk.Revit.UI;
using Autodesk.Revit.DB;
using System.Net.Http;
using System.Text;
using System.Linq;

namespace Nasij.Revit.Commands
{
  [Autodesk.Revit.Attributes.Transaction(Autodesk.Revit.Attributes.TransactionMode.Manual)]
  public class PushSelection : IExternalCommand
  {
    public Result Execute(ExternalCommandData cd, ref string m, ElementSet e)
    {
      UIDocument uidoc = cd.Application.ActiveUIDocument;
      Document doc = uidoc.Document;
      var ids = uidoc.Selection.GetElementIds();
      var payload = new { elementIds = ids.Select(i=>i.IntegerValue).ToArray(), docTitle = doc.Title };
      var json = System.Text.Json.JsonSerializer.Serialize(payload);
      using(var http = new HttpClient())
      {
        var resp = http.PostAsync("http://localhost:9115/bim/ingest", new StringContent(json, Encoding.UTF8, "application/json")).Result;
      }
      return Result.Succeeded;
    }
  }
}
