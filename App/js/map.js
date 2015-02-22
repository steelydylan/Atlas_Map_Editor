Atlas.extendClass(Atlas.Layer,{
	keyDown:function(key){
		this.space = key.space;
		this.shift = key.shift;
		console.log("test");
	},
	keyUp:function(){
		this.space = false;
		this.shift = false;
	},
	touchStart : function(e){
		this.Ex = e.x;
		this.Ey = e.y;
		this.touched = true;		
	},
	touchMove : function(e){
		if(this.touched === true && this.space){
			this.x += e.x - this.Ex;
			this.y += e.y - this.Ey;
			this.Ex = e.x;
			this.Ey = e.y;
		}		
	},
	touchEnd : function(e){
		this.touched = false;
	},
	setSelect:function(ele){
		this.select = $(ele);
	},
	makeGrid:function(width,height,size){
		var x = parseInt(width / size);
		var y = parseInt(height / size);
		for(var i = 0; i <= x; i++){
			var box = new Shape.Box("#FFFFFF",1,height);
			box.x = size * i;
			box.eventEnable = false;
			box.name = "grid";
			if(this.hide === true){
				box.visible = false;
			}
			this.addChild(box);
		}
		for(var i = 0; i <= y; i++){
			var box = new Shape.Box("#FFFFFF",width,1);
			box.y = size * i;
			box.eventEnable = false;
			box.name = "grid";
			if(this.hide === true){
				box.visible = false;
			}
			this.addChild(box);
		}		
	},
	makeGridBySelect:function(width,height){
		var size = this.select.val();
		this.makeGrid(width,height,size)
	},
	makeGridByInput:function(){
		var size = this.select.val();
		var width = size * this.splitX.val();
		var height = size * this.splitY.val();
		this.makeGrid(width,height,size);
	},
	hideGrid:function(){
		var children = this.getChildren({name:"grid"});
		for(var i = 0,n = children.length; i < n; i++){
			children[i].visible = false;
		}
	},
	clearGrid:function(){
		this.removeChildrenByProperty({name:"grid"});
	},
	showGrid:function(){
		var children = this.getChildren({name:"grid"});
		for(var i = 0,n = children.length; i < n; i++){
			children[i].visible = true;
		}
	},
	makeSprite:function(){
		var sprite = new Sprite("map1",512,384);
		sprite.name = "map";
		this.addChild(sprite);
	},
	makeFocus:function(x,y){
		// var box = this.getChild({name:"focus"});
		var size = this.select.val();
		var numberX = Math.floor((x - this.x) / size);
		var numberY = Math.floor((y - this.y) / size);
		var box = new Shape.Box("rgba(255,0,0,0.5)",size,size);
		var sprite = this.getChild({name:"map"});
		var xnum = sprite.width / size;
		box.name = "focus";
		box.x = numberX * size;
		box.y = numberY * size;
		chips.push({resource:numberY * xnum + numberX,x:0,y:0});
		this.addChild(box);
	},
	makeMultiFocus:function(x,y){
		var size = this.select.val();
		var numberX = Math.floor((x - this.x) / size);
		var numberY = Math.floor((y - this.y) / size);
		var sprite = this.getChild({name:"map"});
		var xnum = sprite.width / size;
		var box = this.getChild({name:"focus"});
		var boxX = box.x / size;
		var boxY = box.y / size;
		var minX = (numberX < boxX) ? numberX : boxX;
		var minY = (numberY < boxY) ? numberY : boxY;
		var maxX = (numberX > boxX) ? numberX : boxX;
		var maxY = (numberY > boxY) ? numberY : boxY;
		var x = maxX - minX;
		var y = maxY - minY;
		var addX,addY;
		for(var i = 0; i <= y; i++){
			for(var t = 0; t <= x; t++){
				addX = t + minX;
				addY = i + minY;
				if(addX != boxX || addY != boxY){
					var addBox = new Shape.Box("rgba(255,0,0,0.5)",size,size);
					addBox.name = "focus";
					addBox.x = addX * size;
					addBox.y = addY * size;
					chips.push({resource:addY * xnum + addX,x:t,y:i});
					this.addChild(addBox);
				}
			}
		}
	},
	clearFocus:function(){
		chips = [];
		this.removeChildrenByProperty({name:"focus"});
	}
});
Atlas.DestLayer = Atlas.createClass(Atlas.Layer,{
	initialize:function(elelist,id){
		this.inherit();
		this.gridHistory = [];
		this.gridPointer = 0;
		this.setSplitInput(elelist.$splitX,elelist.$splitY);
		this.setPosInput(elelist.$posX,elelist.$posY);
		this.setSelect(elelist.$select);
		this.makeGridByInput();
		this.hideGrid();
		this.name = "dest";
		this.hide = true;
		this.id = id;
	},
	touchEnd : function(e){
		this.touched = false;
		this.$posX.val(this.x);
		this.$posY.val(this.y);
	},
	makeMap:function(width,height){
		var map = new Map("map1",16,16);
		map.name = "map";
		map.initDrawData(width,height);
		map.setSelect(this.select);
		this.addChild(map);
	},
	setSplitInput:function(ele1,ele2){
		this.splitX = $(ele1);
		this.splitY = $(ele2);
	},
	setPosInput:function(ele1,ele2){
		this.$posX = $(ele1);
		this.$posY = $(ele2);
	},
	updateInputVal:function(x,y){
		this.splitX.val(x);
		this.splitY.val(y);
		this.clearGrid();
		this.makeGridByInput();
		var bg = this.getChild({name:"bg"});
		bg.updateSize(x,y);
	},
	updateGridHistory:function(){
		var x = this.getChildren({name:"grid",width:1}).length - 1;
		var y = this.getChildren({name:"grid",height:1}).length - 1;
		var length = this.gridPointer;
		this.gridHistory[length] = [x,y];
		this.gridPointer++;
	},
	makePreviousGrid:function(){
		var gridHistory = this.gridHistory;
		if(this.gridPointer > 0){
			this.gridPointer--;
			var data = gridHistory[this.gridPointer];
			this.updateInputVal(data[0],data[1]);
		}
		this.gridUpdated = false;
	},
	makeNextGrid:function(){
		var gridHistory = this.gridHistory;
		if(this.gridPointer < gridHistory.length){
			this.gridPointer++;
			var data = gridHistory[this.gridPointer];
			if(typeof(data) != "undefined"){
				this.updateInputVal(data[0],data[1]);
			}
		}
	},
	duplicateLayer:function(id){
		var newlayer = new DestLayer(config,id);
		var bg = this.getChild({name:"bg"});
		var map = this.getChild({name:"map"});
		var newbg = new BgBox(config,bg.width,bg.height);
		var newmap = new Map(map.getImageName(),map.width,map.height);
		newmap.drawData = map.drawData.clone();
		newmap.drawHistory.push(map.drawData.clone());
		newlayer.addChildren(newmap,newbg);
		newlayer.eventEnable = false;
		this.parent.addChild(newlayer);
	}
});
Atlas.extendClass(Atlas.Map,{
	initialize:function(name,x,y){
		this.inherit(name,x,y);
		this.drawHistory = [];
		this.drawPointer = 0;
		this.name = "map";
		// 1 draw
		// 2 erase
		this.fillMode = 1;
	},
	keyDown:function(key){
		if(key.command && key.z && this.parent.eventEnable === true){
			if(key.shift){
				this.makeNextDrawData();
			}else{
				this.makePreviousDrawData();
			}
		}else if(key.e){
			$("#eraser").addClass('active');
			$("#pencil").removeClass('active');
			this.fillMode = 2;
			$()
		}else if(key.d){
			$("#eraser").removeClass('active');
			$("#pencil").addClass('active');
			this.fillMode = 1;
		}
	},
	setSelect:function(ele){
		this.select = $(ele);
	},
	setChipSizeBySelect:function(){
		var size = parseInt(this.select.val());
		this.setSpriteSize(size,size);
		this.setSize(size,size);
	},
	initDrawData:function(width,height){
		var x = parseInt(width / 16);
		var y = parseInt(height / 16);
		var drawData = [];
		for(var i = 0; i < y; i++){
			var arr = [];
			for(var t = 0; t < x; t++){
				arr.push(-1);
			}
			drawData.push(arr)
		}
		this.drawData = drawData;
		this.drawHistory.push(drawData.clone());
	},
	clearDrawData:function(){
		var drawData = this.drawData;
		var y = drawData.length;
		var x = drawData[0].length;
		for(var i = 0; i < y; i++){
			for(var t = 0; t < x; t++){
				drawData[i][t] = -1;
			}
		}
	},
	updateDrawData:function(x,y){
		var drawData = this.drawData;
		var newArray = [];
		for(var i = 0; i < y; i++){
			var arr = [];
			for(var t = 0; t < x; t++){
				if(drawData[i] && typeof(drawData[i][t]) != "undefined"){
					arr.push(drawData[i][t]);
				}else{
					arr.push(-1);
				}
			}
			newArray.push(arr);
		}
		this.drawData = newArray;
		this.updateDrawHistory();
	},
	getTouchedPos:function(e){
		var obj = {};
		obj.x = parseInt((e.x - this.parent.x) / this.width);
		obj.y = parseInt((e.y - this.parent.y) / this.width);
		return obj;
	},
	fillChip:function(e){
		var pos = this.getTouchedPos(e);
		var x = pos.x;
		var y = pos.y;
		var updated = false;
		for(var i = 0,n = chips.length; i < n; i++){
			var chip = chips[i];
			if(this.drawData[y+chip.y] && this.drawData[y+chip.y][x+chip.x] !== undefined){
				updated = true;
				if(this.fillMode === 1){
					this.drawData[y+chip.y][x+chip.x] = chips[i].resource;
				}else{
					this.drawData[y+chip.y][x+chip.x] = -1;
				}
			}
		}
		if(updated){
			this.updateDrawHistory();
		}
	},
	updateDrawHistory:function(){
		this.drawPointer++;
		var length = this.drawPointer;
		this.drawHistory.length = length;
		this.drawHistory[length] = this.drawData.clone();
		this.parent.updateGridHistory();
	},
	makePreviousDrawData:function(){
		var drawHistory = this.drawHistory;
		if(this.drawPointer > 0){
			this.drawPointer--;
			this.drawData = this.drawHistory[this.drawPointer].clone();
		}
		this.parent.makePreviousGrid();
	},
	makeNextDrawData:function(){
		var drawHistory = this.drawHistory;
		if(this.drawPointer < drawHistory.length - 1){
			this.drawPointer++;
			this.drawData = this.drawHistory[this.drawPointer].clone();
		}
		this.parent.makeNextGrid();
	},
	touchStart:function(e){
		//スペースキーが押されていなければ     
		this.touched = true;
		if(!this.parent.space && this.parent.eventEnable === true){
			this.fillChip(e);
		}
	},
	touchMove:function(e){
		if(!this.parent.space && this.touched === true && this.parent.eventEnable === true){
			this.fillChip(e);
		}
	},
	touchEnd:function(e){
		this.touched = false;
	}
});
Atlas.SourceApp = Atlas.createClass(Atlas.App,{
	initialize:function(ele){
		this.inherit(ele);
	},
	touchStart:function(e){
		var layer = this.getChild({name:"source"});
		var focusLength = layer.getChildren({name:"focus"}).length;
		if(layer.shift && focusLength == 1){
			layer.makeMultiFocus(e.x,e.y);
		}else{
			layer.clearFocus();
			layer.makeFocus(e.x,e.y);
		}
	}
});
Atlas.downloadApp = Atlas.createClass(Atlas.App,{
	initialize:function(){
		this.inherit();
	},
	downloadMap:function(path,dest){
		var fs = require("fs");
		var layers = dest.getChildren({name:"dest"});
		var thisctx = this.ctx;
		var minX=-1;
		var minY=-1;
		var maxX=0;
		var maxY=0;
		layers.forEach(function(layer){
			var map = layer.getChild({name:"map"});
			if(minX == -1 || minX > layer.x){
				minX = layer.x;
			}
			if(minY == -1 || minY > layer.y){
				minY = layer.y;
			}
			if(maxX < layer.x + map.getMapWidth()){
				maxX = layer.x + map.getMapWidth();
			}
			if(maxY < layer.y + map.getMapHeight()){
				maxY = layer.y + map.getMapHeight();
			}
		});
		this.setSize(maxX-minX,maxY-minY);
		this.setQuality(maxX-minX,maxY-minY);
		layers.forEach(function(layer){
			var map = layer.getChild({name:"map"});
			map._x -= minX;
			map._y -= minY;
			var ctx = map.ctx;
			map.ctx = thisctx;
			map.draw();
			map.ctx = ctx;
			map._x += minX;
			map._y += minY;
		});
		fs.writeFileSync(path,this.field.toDataURL().replace(/^data:image\/png;base64,/, ""),"base64");
	},
});
Atlas.BgBox = Atlas.createClass(Atlas.Shape.Box,{
	initialize: function(config,x,y){
		this.inherit($(config.$bgColor).val(),x,y);
		this.name = "bg";
		this.$color = $(config.$bgColor);
		this.$alpha = $(config.$bgAlpha);
		this.updateColor();
	},
	updateSize:function(x,y){
		this.width = x * this.parent.select.val();
		this.height = y * this.parent.select.val();
	},
	isHex:function(string){
		if(typeof(string) == "string"){
			return /#[0-9A-Fa-f]{6}/.test(string);
		}
	},
	updateColor:function(){
		var color = this.$color.val();
		var alpha = this.$alpha.val();
		if(this.isHex(color)){
			alpha = alpha / 100;
			this.color = color;
			this.alpha = alpha;
		}
	}
});
Atlas();
var chips = [];
var config = {
	$splitX:"#destSplitX",
	$splitY:"#destSplitY",
	$posX:"#posX",
	$posY:"#posY",
	$select:"#chipSize",
	$bgColor:"#changeColor",
	$bgAlpha:"#changeAlpha",
	appSizeX:300,
	appSizeY:300,
	destSizeX:790,
	destSizeY:640,
}
Atlas.main(function(){
	var app = new SourceApp("map");
	app.id = 1;
	app.load(["./images/map.png","map1"]);
	app.setSize(config.appSizeX,config.appSizeY);
	app.setQuality(config.appSizeX,config.appSizeY);
	app.setColor("black");
	var dest = new App("dest");
	dest.eraseMode = false;
	dest.id = 1;
	dest.setSize(config.destSizeX,config.destSizeY);
	dest.setQuality(config.destSizeX,config.destSizeY);
	dest.setColor("white");
	var layer = new Layer();
	layer.setSelect("#chipSize");
	layer.name = "source";
	layer.makeSprite();
	layer.makeGridBySelect(512,384);
	var destLayer = new DestLayer(config,dest.id);
	var bg = new BgBox(config,512,384);
	destLayer.addChild(bg);
	destLayer.makeMap(512,384);
	var writer = new downloadApp();
	$("#showGrid").change(function(){
		var destLayer = dest.getChild({eventEnable:true,name:"dest"});
		if($(this).prop("checked")){
			destLayer.hide = false;
			destLayer.showGrid();
		}else{
			destLayer.hide = true;
			destLayer.hideGrid();
		}
	});
	$("#imgUpload").change(function(){
		var file = $(this).prop("files")[0];
		var fr = new FileReader();
		fr.onload = function(){
			$("#imgPreview").attr("src",fr.result);
		}
		fr.readAsDataURL(file);
	});
	$("#mapChipSet").click(function(){
		app.id++;
		app.load([$("#imgPreview").attr("src"),"map"+app.id]);
		var image = new Image();
		image.onload = function(){
			var x = parseInt($(config.$splitX).val());
			var y = parseInt($("#destSplitY").val());
			var map = layer.getChild({name:"map"});
			map.setImage("map"+app.id);
			map.setSpriteSize(this.width,this.height);
			map.setSize(this.width,this.height);
			layer.clearFocus();
			layer.clearGrid();
			layer.makeGridBySelect(this.width,this.height);
			var destLayer = dest.getChild({eventEnable:true,name:"dest"});
			var bg = destLayer.getChild({name:"bg"});
			bg.updateSize(x,y);
			var destMap = destLayer.getChild({name:"map"});
			destMap.setImage("map"+app.id);
			destMap.setChipSizeBySelect();
			destMap.clearDrawData();
			destMap.drawHistory = [];
			destLayer.clearGrid();
			destLayer.makeGridByInput();
		}
		image.src = $("#imgPreview").attr("src");
	});
	$("#destSplitX,#destSplitY").change(function(){
		var x = parseInt($(config.$splitX).val());
		var y = parseInt($("#destSplitY").val());
		var destLayer = dest.getChild({eventEnable:true,name:"dest"});
		var map = destLayer.getChild({name:"map"});
		var bg = destLayer.getChild({name:"bg"});
		map.updateDrawData(x,y);
		bg.updateSize(x,y);
		destLayer.clearGrid();
		destLayer.makeGridByInput();
	});
	$("#changeColor").change(function(){
		var destLayer = dest.getChild({eventEnable:true,name:"dest"});
		var bg = destLayer.getChild({name:"bg"});
		bg.updateColor();
	});
	$("#changeAlpha").change(function(){
		var destLayer = dest.getChild({eventEnable:true,name:"dest"});
		var bg = destLayer.getChild({name:"bg"});
		bg.updateColor();
	});
	$("#destChooser").attr('nwworkingdir',process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']);
	$("#destChooser").change(function(e){
		var path = $(this).val();
		$(this).val("");
		writer.downloadMap(path,dest);
	});
	$("#exportMap").click(function(){
		$("#destChooser").trigger('click');
	});
	$(window).keydown(function (e){
	    if ((e.metaKey || e.ctrlKey) && e.keyCode == 83) { /*ctrl+s or command+s*/
	        $("#destChooser").trigger('click');
	    }else if(e.keyCode == 8){
	    	$("#delete").trigger("click");
	    }else if((e.metaKey || e.ctrlKey) && e.keyCode == 78){
	    	$("#addNew").trigger("click");
	    }else if((e.metaKey || e.ctrlKey) && e.keyCode == 68){
	    	$("#duplicate").trigger("click");
	    }
	});
	$("#pencil").click(function(){
		var destLayer = dest.getChild({eventEnable:true,name:"dest"});
		var destMap = destLayer.getChild({name:"map"});
		$(this).addClass('active');
		$("#eraser").removeClass('active');
		destMap.fillMode = 1;
	});
	$("#eraser").click(function(){
		var destLayer = dest.getChild({eventEnable:true,name:"dest"});
		var destMap = destLayer.getChild({name:"map"});
		$(this).addClass('active');
		$("#pencil").removeClass('active');
		destMap.fillMode = 0;
	});
	$("#posX").change(function(){
		var destLayer = dest.getChild({eventEnable:true,name:"dest"});
		destLayer.x = parseInt($(this).val());
	});
	$("#posY").change(function(){
		var destLayer = dest.getChild({eventEnable:true,name:"dest"});
		destLayer.y = parseInt($(this).val());
	});
	$("#sortable").sortable({
		axis:"y",
		start:function(e,ui){
			var data = ui.item.data('id');
		  	var idx;
			$(this).find('li').each(function(index) {
				if(data == $(this).data('id')){
					idx = index;
				}
	        });
	        $(this).prop("index",idx);
		},
		update:function(e,ui){
	      	var data = ui.item.data('id');
	        var idx = $(this).prop("index");
	        var temp;
	        $(this).find('li').each(function(index) {
	          	if(data == $(this).data('id')){
		          	temp = index;
	          	}
	        });
	        var length = $(this).find("li").length;
	        dest.swap(length - idx - 1,length - temp - 1);
		}
	});
	$("#delete").click(function(){
		var destLayer = dest.getChild({eventEnable:true,name:"dest"});
		if(destLayer){
			destLayer.remove();
			$("#sortable .active").remove();
		}
	});
	$("#duplicate").click(function(){
		var destLayer = dest.getChild({eventEnable:true,name:"dest"});
		if(destLayer){
			dest.id++;
			destLayer.duplicateLayer(dest.id);
			$("#sortable").prepend("<li data-id='"+dest.id+"'>Map"+dest.id+"</li>");
		}
	});
	$(document).click(function(){
		$("#contextmenu").css("display","none");
	});
	$(document).on("click contextmenu","#sortable li",function(e){
		if(e.type == "contextmenu"){
			$("#contextmenu").css({"display":"block","left":e.pageX,"top":e.pageY});
			e.preventDefault();
		}
		$("#sortable li").removeClass('active');
		$(this).addClass('active');
		var layers = dest.getChildren({name:"dest"});
		layers.forEach(function(layer){
			layer.eventEnable = false;
			layer.hideGrid();
		});
		var destLayer = dest.getChild({id:$(this).data("id"),name:"dest"});
		destLayer.eventEnable = true;
		var destMap = destLayer.getChild({name:"map"});
		var image = destMap.getImage();
		$("#imgPreview").attr("src",image.src);
		$("#posX").val(destLayer.x);
		$("#posY").val(destLayer.y);
		$(config.$splitX).val(destMap.drawData[0].length);
		$("#destSplitY").val(destMap.drawData.length);
		$("#chipSize").val(destMap.width);
		if(destLayer.hide === true){
			$("#showGrid").prop("checked","");
		}else{
			$("#showGrid").prop("checked","checked");
			destLayer.showGrid();
		}
		var bg = destLayer.getChild({name:"bg"});
		$("#changeColor").val(bg.color);
		$("#changeAlpha").val(bg.alpha*100);
		var map = layer.getChild({name:"map"});
		map.img = destMap.img;
		map.setSpriteSize(image.width,image.height);
		map.setSize(image.width,image.height);
		layer.removeChildren({name:"focus"});
		layer.clearGrid();
		layer.makeGridBySelect(map.width,map.height);
		chips = [];
	});
	$("#addNew").click(function(){
		dest.id++;
		var destLayer = new DestLayer(config,dest.id);
		var bg = new BgBox(config,512,384);
		destLayer.addChild(bg);
		destLayer.makeMap(512,384);
		destLayer.eventEnable = false;
		dest.addChild(destLayer);
		$("#sortable").prepend("<li data-id='"+dest.id+"'>Map"+dest.id+"</li>");
	});
	app.addChild(layer);
	app.start();
	dest.addChild(destLayer);
	dest.start();
});