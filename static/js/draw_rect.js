var width  = 1000;
var height = 1000;
var sq = 2;
var projection = d3.geo.mercator()
						.center([107, 31])
						.scale(850)
    					.translate([width/2, height/2]);
var colormap={
	'happy':'rgb(205,179,107)',
	'like':'rgb(146,194,128)',
	'fear':'rgb(71,198,177)',
	'shock':'rgb(24,198,232)',
	'sad':'rgb(128,185,254)',
	'dislike':'rgb(209,165,234)',
	'anger':'rgb(250,153,183)'
};
function get_score(sql)
{
	var score=0;
	content={'sql':sql};
	post("/upload", content,function(retdata){
		console.log(retdata);
	})
}
function draw_map(name,left,top)
{
	d3.selectAll("button")
	  .on("click",function(d){
	  	d3.select(".main")
		  .select(".areas")
		  .remove();

		d3.select(".main")
		  .select(".content")
		  .append('g')
		  .attr("transform", "translate(0,0)")
		  .classed('areas',true);

		calculate_score(d3.select(this).attr("id"));
	  })

	var zoom=d3.behavior.zoom()
						.scaleExtent([1,10])
						.on("zoom",zoomed);

	var svg = d3.select("body").append("svg")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class","main")
	    .style("position","absolute")
	    .style("left",left)
	    .style("top",top)
	    .append("g")
	    .classed("content",true)
	    .call(zoom)
	    .append("g")
	    .attr("transform", "translate(0,0)");
	
	// var projection = d3.geo.mercator()
	// 					.center([107, 31])
	// 					.scale(550)
 //    					.translate([320, 100]);
	
	var eps=1e-4;
 	var graticule=d3.geo.graticule()
 					.extent([[70,15],[140,55]])
 					.step([1,1]);
 	var grid=graticule();

	var path = d3.geo.path()
					.projection(projection);
	d3.select(".main")
	   .select(".content")
	   .append("path")
	   .datum(grid)
	   .attr("class","graticule")
	   .attr("stroke","#D3D3D3")
	   .attr("stroke-width",1)
	   .attr("d",path);
	
	var color = d3.scale.category20();
	
	
	d3.json("static/China.geojson", function(error, root) {
		
		if (error) 
			return console.error(error);
		console.log(root.features);
		
		svg.selectAll("path")
			.data( root.features )
			.enter()
			.append("path")
			.attr("stroke","#FFFFFF")
			.attr("stroke-width",1)
			.attr("fill", "#EBEBEB")
			.attr("d", path );
	});

	d3.select(".main")
	  .select(".content")
	  .append('g')
	  .attr("transform", "translate(0,0)")
	  .classed('areas',true);

	d3.select('.btn-group')
	  .selectAll('button')
	  .on('click',function(){
	  	var emotion_type=d3.select(this).text();
	  	d3.select(".rect")
	  	  .remove();
	  	calculate_score(emotion_type);
	  })

}
function calculate_score(emo_type) 
{
	//var sql_content='select '+emo_type+' from score';
	var sql_content='select happy, like, anger, sad, fear, dislike, shock from score';
	var content={'sql':sql_content,'database':'mydata_12_25_af_pro.db'};
	post("/upload", content,function(retdata){
		// sql_content='select max('+emo_type+') from score';
		var sql_content="select max(sum) from (select happy + like + anger + sad + fear + dislike + shock as sum from score)";
		content={'sql':sql_content,'database':'mydata_12_25_af_pro.db'};
		post("/upload", content, function(max){
			var svg=d3.select('.main')
					  		  .append('g')
					  		  .attr('class','rect');
			for (var i=0; i<40/sq; i++)
			{
				//emo_score[i]=new Array(70);
				for(var j=0; j<70/sq; j++)
				{
					//emo_score[i][j]=retdata[i*70+j][0];
					var x=i*sq+15;
					var y=j*sq+70;
					
					draw_rect(x+2, y, retdata[i*70/sq+j][0]+retdata[i*70/sq+j][1]+retdata[i*70/sq+j][2]+retdata[i*70/sq+j][3]+retdata[i*70/sq+j][4]+retdata[i*70/sq+j][5]+retdata[i*70/sq+j][6], max[0][0], emo_type);
				}
			}
		});
		
	});
}
function draw_rect(x,y,score,max,emo_type)
{
  var point=new Object();
  var p_tran=new Object();
  var width=score/max*30;
  point.x=x;
  point.y=y;
  p_tran=tran_coord(point,projection);
  var svg=d3.select('.rect')
  			.append('rect')
  			.attr('fill',colormap[emo_type])
  			.attr('x',p_tran.x)
  			.attr('y',p_tran.y)
  			.attr('width',width)
  			.attr('height',width);

}
function tran_coord(coord, projection)
{
	var point=projection([coord.y,coord.x]);
	var res=new Object();
	//console.log(coord.x,coord.y);
	res.x=point[0];
	res.y=point[1];
	//nsole.log(res);
	return res;
}
function zoomed()
{
	d3.select(this)
	  .attr("transform",
	  	'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
}
function load_page()
{
	draw_map('happy',0,30);
	calculate_score('happy');
}