
// NASIJ ExtendScript: build comp from JSON and queue to Adobe Media Encoder
(function(){
  var f = File.openDialog("Select NASIJ scene JSON");
  if(!f) { alert("No file"); return; }
  f.open('r'); var txt = f.read(); f.close();
  var obj = JSON.parse(txt);
  app.beginUndoGroup("NASIJ Build");
  var comp = app.project.items.addComp(obj.name||"NASIJ", obj.w||1920, obj.h||1080, 1, obj.dur||60, obj.fps||30);
  // text layer example
  var t = comp.layers.addText(obj.title||"NASIJ");
  t.property("Position").setValue([obj.w/2, 100]);
  app.project.renderQueue.items.add(comp);
  app.project.renderQueue.queueInAME(true);
  app.endUndoGroup();
})();
