var width  = 1000;
var height = 1000;

var width_c=800;
var height_c=500;

var sq = 2;
var projection = d3.geo.mercator()
						.center([107, 31])
						.scale(850)
    					.translate([width/2, height/2]);
var emotion_array=['happy','like','fear','shock','sad','dislike','anger'];
var colormap={
	'happy':'rgb(205,179,107)',
	'like':'rgb(146,194,128)',
	'fear':'rgb(71,198,177)',
	'shock':'rgb(24,198,232)',
	'sad':'rgb(128,185,254)',
	'dislike':'rgb(209,165,234)',
	'anger':'rgb(250,153,183)',
	'all':'rgb(245,160,131)'
};
var xAxisWidth=700;
var yAxisWidth=400;
var xScale=d3.scale.linear()
			 .domain([70,140])
			 .range([0,xAxisWidth]);
var yScale=d3.scale.linear()
			 .domain([15,55])
			 .range([yAxisWidth,0]);
var padding={top:30, right:30, bottom:50, left:30};
var click_num=0;
var position=[100,300];
var topic_position=new Array();
var emotion_now="";
var topic_num=0;
var emotion_list=["全文","红包","现金","金额","群发","有缘人","现在","今天","二哈","吃惊","微笑","花心","摊手","抱抱","坏笑",
"舔屏","允悲","笑而不语","费解","憧憬","嘻嘻","哈哈","可爱","可怜","挖鼻","害羞","挤眼","闭嘴","鄙视","爱你","偷笑",
"亲亲","生病","太开心","白眼","左哼哼","右哼哼","委屈","哈欠","抱抱","疑问","馋嘴","拜拜","思考","失望","鼓掌","悲伤",
"抓狂","黑线","阴险","怒骂","互粉","伤心","猪头","熊猫","兔子","书呆子","愤怒","傻眼","骷髅","打脸","半星","时候","昨天"];
var database_list={
	'time1':'mydata_10_12_pro_0.db',
	'time2':'mydata_13_15_pro_0.db',
	'time3':'mydata_16_18_pro_0.db',
	'time4':'mydata_19_21_pro_0.db',
	'time5':'mydata_22_24_pro_0.db',
	'time6':'mydata_1_3_pro_0.db',
	'time7':'mydata_4_6_pro_0.db',
	'time8':'mydata_12_25_af_pro_0.db'
}
var time_now='time1';
var database=database_list['time1'];
var ani_on=0;
var interval_id;
var opacity_list=[0.2,0.4,0.6,1.0];
function draw_map(left,top)
{
	d3.select(".btn-group")
	  .selectAll("button")
	  .on("click",function(d){
	  	var emo_type=d3.select(this).attr("id");
	  	d3.select("#"+emo_type)
	  	  .style("background-color","#D3D3D3");
	  	for(p in colormap)
	  	{
	  		if(p!=emo_type)
	  			d3.select("#"+p)
	  		  	  .style("background-color","white");
	  	}
	  	var areas=d3.select(".map")
		  			.select(".areas");
		areas.selectAll("polygon")
		  	 .transition()
		     .duration(1000)
		     .ease("linear")
		     .attr("opacity",0)
		     .remove();
		d3.select("#map_circle")
		  .remove();
		d3.select(".topic")
		  .selectAll("div")
		  .remove();
		for(var i=1;i<9;i++)
		{
			d3.select("#time"+i+"_text")
			  .html("");
		}
		get_data(emo_type,1);
	  });
	d3.select("#topic")
	  .on("click",function(){
	  	topic_num+=1;
		if(topic_num%2==1)
			for(var i=0;i<topic_position.length;i++)
				get_topic(emotion_now,topic_position[i][0],topic_position[i][1]);
		else
			d3.select(".topic")
		      .selectAll("div")
			  .remove();
	  });
	d3.select(".timeline")
	  .selectAll(".line_circle")
	  .on("click",function(){
	  	d3.select(".topic")
	  	  .selectAll("div")
	  	  .remove();
	  	d3.select("#"+time_now)
	  	  .style("fill","white");
	  	d3.select(this)
	  	  .style("fill","#A9A9A9");
	  	for(var i=1;i<9;i++)
		{
			d3.select("#time"+i+"_text")
			  .html("");
		}
	  	time_now=d3.select(this).attr("id");
	  	database=database_list[time_now];
	  	console.log(time_now);
	  	change_time();
	  });

	d3.select("#animation")
	  .on("click",function(){
	  	if(ani_on==0)
	  	{
	  		interval_id=setInterval(update,3000);
	  	}
	  	else
	  		clearInterval(interval_id);
	    ani_on+=1;
	    if(ani_on>1) ani_on=0;
	  });
	d3.select("#update")
	  .on("click",function(){
	  	d3.select(".emo_circles")
	  	  .selectAll("circle")
	  	  .remove();
	  	for(var i=0;i<7;i++)
	  	{
	  		get_data(emotion_array[i],2);
	  	}
	  });
	// var zoom=d3.behavior.zoom()
	// 					.scaleExtent([1,10])
	// 					.on("zoom",zoomed);

	var svg = d3.select("body").append("svg")
		.attr("class","map")
	    .attr("width", width)
	    .attr("height", height)
	    .style("position","absolute")
	    .style("left",left)
	    .style("top",top)
	    .append("g")
	    .classed("content",true)
	    .append("g");
	
	
	var color = d3.scale.category20();
	
	
	d3.json("static/China.geojson", function(error, root) {
		
		if (error) 
			return console.error(error);
		//console.log(root.features);

		var groups=svg.append("g")
					  .attr("class","map");
		
		groups.selectAll("path")
			.data( root.features )
			.enter()
			.append("path")
			.attr("stroke","#FFFFFF")
			.attr("stroke-width",1)
			.attr("fill", "#EBEBEB")
			.attr("d", path );
	});

	//绘制网格线
	var eps=1e-4;
 	var graticule=d3.geo.graticule()
 					.extent([[70,15],[140,55]])
 					.step([2,2]);
 	var grid=graticule();
	
	var path = d3.geo.path()
					.projection(projection);

	d3.select(".map")
	   .select(".content")
	   .append("path")
	   .datum(grid)
	   .attr("class","graticule")
	   .attr("stroke","#D3D3D3")
	   .attr("stroke-width",1)
	   .attr("d",path);
	create_group();
}
//draw_type:
//1 isoband
//2 circles
function get_data(emo_type, draw_type)
{
	var sql_content="";
	if(emo_type=="all")
		sql_content='select happy, like, fear, shock, sad, dislike, anger from score';
	else
		sql_content='select '+emo_type+' from score';

	var content={'sql':sql_content, 'database':database};
	post("/upload", content, function(retdata){
		var inf_array=new Array(89);
		for(var m=0; m<89; m++)
		{
			inf_array[m]=new Array(149);
			for(var k=0; k<149; k++)
			{
				inf_array[m][k]=0;
			}
		}
		var score_array=new Array(20);
		var score_all=0;
		for(var i=0; i<40/sq;i++)
		{
			score_array[i]=new Array(35);
			for(var j=0; j<70/sq;j++)
			{
				if(emo_type=="all")
					score_array[i][j]=retdata[i*70/sq+j][0]+retdata[i*70/sq+j][1]+retdata[i*70/sq+j][2]+retdata[i*70/sq+j][3]+retdata[i*70/sq+j][4]+retdata[i*70/sq+j][5]+retdata[i*70/sq+j][6];
				else
					score_array[i][j]=retdata[i*70/sq+j][0];
				score_all+=score_array[i][j];
			}
		}
		if(draw_type==1)
		{
			calculate_score(emo_type,score_array);
			d3.select("#"+time_now+"_text")
			  .html(score_all);
			console.log(score_all);
		}
			
		else if(draw_type==2)
			sort_score(score_array,colormap[emo_type],emo_type);
	});
}
//计算感情分数0~1　calculate the emotion score
function calculate_score(emo_type,score_array) 
{
	var inf_array=new Array(89);
	for(var m=0; m<89; m++)
	{
		inf_array[m]=new Array(149);
		for(var k=0; k<149; k++)
		{
			inf_array[m][k]=0;
		}
	} 
	topic_position=new Array();
	emotion_now=emo_type;
	topic_num=0;
	var max_score=d3.max(d3.max(score_array));
	//console.log(max_score);
	for (var i=0; i<40/sq; i++)
	{
		//emo_score[i]=new Array(70);
		for(var j=0; j<70/sq; j++)
		{
			//emo_score[i][j]=retdata[i*70+j][0];
			var x=i*sq+15;
			var y=j*sq+70;

			if((emo_type!="all")&&(score_array[i][j]>=4/5*max_score))
			{
				//console.log(x,y);
				topic_position.push([x,y]);
			}

			var cal_res=calculate_inf(x+1 , y+1 , score_array[i][j]);
			for(var cx=0; cx<13; cx++)
			{
				var ix = i*4 + cx;
				for(var cy=0; cy<13; cy++)
				{
					var iy = j*4 + cy;
					//console.log(ix,iy);
					var before=inf_array[ix][iy];
					inf_array[ix][iy]=before+cal_res[cx][cy];
				}
			}
		}
	}
	var max=inf_max(inf_array);
		
	draw_line(1/10,max,inf_array,colormap[emo_type],0.2,emo_type,"layer1");
	draw_line(1/5,max,inf_array,colormap[emo_type],0.4,emo_type,"layer2");       
	draw_line(2/5,max,inf_array,colormap[emo_type],0.6,emo_type,"layer3");
	draw_line(3/5,max,inf_array,colormap[emo_type],1,emo_type,"layer4");
	map_circle();

	// for(var i=0;i<topic_position.length;i++)
	// 	get_topic(emo_type,topic_position[i][0],topic_position[i][1]);
}
function inf_max(inf_array)
{
	var max=0;
	for(var i=0;i<89;i++)
	{
		for(var j=0;j<149;j++)
		{
			if(max<inf_array[i][j])
				max=inf_array[i][j];
		}
	}
	//console.log(max);
	return max;
}
function inf_min(inf_array,max)
{
	var min=max;
	for(var i=0;i<89;i++)
	{
		for(var j=0;j<149;j++)
		{
			if((min>inf_array[i][j]) && (inf_array[i][j]!=0))
				min=inf_array[i][j];
		}
	}
	return min;
}
function create_group()
{
	click_num=0;
	// d3.select(".areas")
	//   .remove();
	var content=d3.select(".map")
	  			  .select(".content")
	  			  .append("g")
	  			  .attr("class","areas");
	content.append("g")
	       .attr("class","layer1");
	content.append("g")
	       .attr("class","layer2");
	content.append("g")
	       .attr("class","layer3");
	content.append("g")
	       .attr("class","layer4");
	content.on("mouseover",function(d){
	  	var area=d3.select(".areas");
	  	var emo_array=area.attr("id").split("_");
	  	var emo_type=emo_array[0];
	  	//console.log(emo_type);
	  	if(emo_type!="all")
	  	{
	  		d3.select("."+emo_type+"_circles")
		  	  .selectAll("circle")
			  .attr("fill-opacity",0.7);
			for(var p in colormap)
		  	{
		  		if(p!=emo_type)
		  		{
		  			d3.select("."+p+"_circles")
		  			  .selectAll("circle")
		  			  .attr("fill-opacity",0.1)
		  			  .attr("stroke-opacity",0.1);
		  		}
		  	}
	  	}
	  })
	  .on("mouseout",function(d){
	  	if(click_num%2==0)
	  	{
	  		for(var p in colormap)
		  	{
		  		d3.select("."+p+"_circles")
		  		  .selectAll("circle")
		  		  .attr("fill-opacity",0.3)
		  		  .attr("stroke-opacity",1);
		  	}
	  	}
	  })
	  .on("click",function(){
	  	console.log(click_num);
	  	var area=d3.select(".areas");
	  	var emo_array=area.attr("id").split("_");
	  	var emo_type=emo_array[0];
	  	click_num+=1;
	  	if((emo_type!="all")&&(click_num%2==1))
	  	{
	  		d3.select("."+emo_type+"_circles")
	  		  .selectAll("circle")
	  		  .attr("fill-opacity",0.7);
	  		for(var p in colormap)
		  	{
		  		if(p!=emo_type)
		  		{
		  			d3.select("."+p+"_circles")
		  			  .selectAll("circle")
		  			  .attr("fill-opacity",0.1)
		  			  .attr("stroke-opacity",0.1);
		  		}
		  	}
	  	}
	  	else
	  	{
	  		for(var p in colormap)
		  	{
		  		d3.select("."+p+"_circles")
		  		  .selectAll("circle")
		  		  .attr("fill-opacity",0.3)
		  		  .attr("stroke-opacity",1);
		  	}
	  	}	
	  });
	d3.select("body")
	  .append("g")
	  .attr("class","topic");
}
//计算影响力
//score 2*2矩形范围内的微博数
//res 对0.5间隔坐标轴的影响力大小
//影响范围1.5*2
function calculate_inf(x,y,score)
{
	var res = new Array(13);
	for(var i=0;i<13;i++)
	{
		res[i]=new Array(13);
		for(var j=0;j<13;j++)
		{
			res[i][j]=0;
		}
	}
	for(var px=0; px<13; px++)
	{
		var x_distance = (px-6)*0.5;
		var x_inf = x + x_distance;
		if((x_inf >= 15) && (x_inf <= 55))
		{
			for(var py=0; py<13; py++)
			{
				var y_distance = (py-6)*0.5;
				var y_inf = y + y_distance;
				if((y_inf >= 70) && (y_inf <= 140))
				{
					var distance_sq = (x_distance*x_distance) + (y_distance*y_distance);
					if(Math.sqrt(distance_sq)<3)
					{
						var inf_res = score * (3*3 - 2*3*Math.sqrt(distance_sq)+distance_sq) / (3*3);
						res[px][py] = inf_res;
						// if(inf_res>0.2)
						// 	console.log(inf_res);
					}
				}
			}
		}
	}
	return res;
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
function tran_scale(position)
{
	var x0=xScale.invert(position[0]-padding.left);
	var y0=yScale.invert(500-padding.bottom-position[1]);
	return center=projection([x0,y0]);
}
//threshold 阈值
function draw_line(thre,max,res_array,color,op,emo_type,layer)
{
	var draw_array=new Array(89);
	for(var m=0; m<89; m++)
	{
		draw_array[m]=new Array(149);
		for(var k=0; k<149; k++)
		{
			draw_array[m][k]=0;
		}
	}
	for(var i=0; i<89; i++)
	{
		for(var j=0; j<149; j++)
		{
			draw_array[i][j]=res_array[i][j]/max;
		}
	}

    for(var x=0; x<88; x++)
	{
		for(var y=1; y<149; y++)
		{
			var point_this=0;
			var point_right=0;
			var point_lowright=0;
			var point_low=0;
			var flag=1;
			if(draw_array[x][y]>=thre)
				point_this=1;
			if(draw_array[x+1][y]>=thre)
				point_right=1;
			if(draw_array[x+1][y-1]>=thre)
				point_lowright=1;
			if(draw_array[x][y-1]>=thre)
				point_low=1;

			var fa=draw_array[x][y];
			var fb=draw_array[x+1][y];
			var fd=draw_array[x+1][y-1];
			var fc=draw_array[x][y-1];

			var value=point_this*8+point_right*4+point_lowright*2+point_low*1;
			var isoband_data=new Array();
			var coord=new Object();

			var coord_a=new Object();
			coord_a.x=x/2+13;
			coord_a.y=y/2+68;

			var coord_b=new Object();
			coord_b.x=x/2+13.5;
			coord_b.y=y/2+68;

			var coord_c=new Object();
			coord_c.x=x/2+13;
			coord_c.y=y/2+67.5;

			var coord_d=new Object();
			coord_d.x=x/2+13.5;
			coord_d.y=y/2+67.5;

			var coord_ab=new Object();
			coord_ab.x=(x/2+13.5)+(-0.5)*(thre-fb)/(fa-fb);
			coord_ab.y=y/2+68;

			var coord_ac=new Object();
			coord_ac.x=x/2+13;
			coord_ac.y=(y/2+67.5)+0.5*(thre-fc)/(fa-fc);

			var coord_cd=new Object();
			coord_cd.x=(x/2+13.5)+(-0.5)*(thre-fd)/(fc-fd);
			coord_cd.y=y/2+67.5;

			var coord_bd=new Object();
			coord_bd.x=x/2+13.5;
			coord_bd.y=(y/2+68)+(-0.5)*(thre-fb)/(fd-fb);


			if(value==1)
			{
				isoband_data.push(tran_coord(coord_ac, projection));
				isoband_data.push(tran_coord(coord_c, projection));
				isoband_data.push(tran_coord(coord_cd, projection));
			}
			else if(value==14)
			{
				isoband_data.push(tran_coord(coord_a, projection));
				isoband_data.push(tran_coord(coord_b, projection));
				isoband_data.push(tran_coord(coord_d, projection));
				isoband_data.push(tran_coord(coord_cd, projection));
				isoband_data.push(tran_coord(coord_ac, projection));
			}
			else if(value==2)
			{
				isoband_data.push(tran_coord(coord_d, projection));
				isoband_data.push(tran_coord(coord_bd, projection));
				isoband_data.push(tran_coord(coord_cd, projection));
			}
			else if(value==13)
			{
				isoband_data.push(tran_coord(coord_a, projection));
				isoband_data.push(tran_coord(coord_b,projection));
				isoband_data.push(tran_coord(coord_bd, projection));
				isoband_data.push(tran_coord(coord_cd, projection));
				isoband_data.push(tran_coord(coord_c, projection));
			}
			else if(value==3)
			{
				isoband_data.push(tran_coord(coord_ac, projection));
				isoband_data.push(tran_coord(coord_c, projection));
				isoband_data.push(tran_coord(coord_d, projection));
				isoband_data.push(tran_coord(coord_bd, projection));
			}
			else if(value==12)
			{
				isoband_data.push(tran_coord(coord_a, projection));
				isoband_data.push(tran_coord(coord_b, projection));
				isoband_data.push(tran_coord(coord_bd, projection));
				isoband_data.push(tran_coord(coord_ac, projection));
			}
			else if(value==4)
			{
				isoband_data.push(tran_coord(coord_ab, projection));
				isoband_data.push(tran_coord(coord_b, projection));
				isoband_data.push(tran_coord(coord_bd, projection));
			}
			else if(value==11)
			{
				isoband_data.push(tran_coord(coord_a, projection));
				isoband_data.push(tran_coord(coord_ab, projection));
				isoband_data.push(tran_coord(coord_bd, projection));
				isoband_data.push(tran_coord(coord_d, projection));
				isoband_data.push(tran_coord(coord_c, projection));
			}
			else if(value==5)
			{
				isoband_data.push(tran_coord(coord_ac, projection));
				isoband_data.push(tran_coord(coord_c, projection));
				isoband_data.push(tran_coord(coord_cd, projection));
				isoband_data.push(tran_coord(coord_bd, projection));
				isoband_data.push(tran_coord(coord_b, projection));
				isoband_data.push(tran_coord(coord_ab, projection));
				
			}
			else if(value==10)
			{
				isoband_data.push(tran_coord(coord_a, projection));
				isoband_data.push(tran_coord(coord_ab, projection));
				isoband_data.push(tran_coord(coord_bd, projection));
				isoband_data.push(tran_coord(coord_d, projection));
				isoband_data.push(tran_coord(coord_cd, projection));
				isoband_data.push(tran_coord(coord_ac, projection));
			}
			else if(value==6)
			{
				isoband_data.push(tran_coord(coord_ab, projection));
				isoband_data.push(tran_coord(coord_b, projection));
				isoband_data.push(tran_coord(coord_d, projection));
				isoband_data.push(tran_coord(coord_cd, projection));	
			}
			else if(value==9)
			{
				isoband_data.push(tran_coord(coord_a, projection));
				isoband_data.push(tran_coord(coord_ab, projection));
				isoband_data.push(tran_coord(coord_cd, projection));
				isoband_data.push(tran_coord(coord_c, projection));
			}
			else if(value==7)
			{
				isoband_data.push(tran_coord(coord_ac, projection));
				isoband_data.push(tran_coord(coord_c, projection));
				isoband_data.push(tran_coord(coord_d, projection));
				isoband_data.push(tran_coord(coord_b, projection));
				isoband_data.push(tran_coord(coord_ab, projection));
			}
			else if(value==8)
			{
				isoband_data.push(tran_coord(coord_a, projection));
				isoband_data.push(tran_coord(coord_ab, projection));
				isoband_data.push(tran_coord(coord_ac, projection));
			}
			else if(value==15)
			{
				isoband_data.push(tran_coord(coord_a, projection));
				isoband_data.push(tran_coord(coord_b, projection));
				isoband_data.push(tran_coord(coord_d, projection));
				isoband_data.push(tran_coord(coord_c, projection));
			}
			else
			{
				flag=0;
			}

	 		if(flag!=0)
				var svg= d3.select(".map")
							.select(".areas")
							.attr("id",emo_type+"_areas")
							.select("."+layer)
							.datum(isoband_data)
		 					.append("polygon")
							.attr('points',function(d,i){
								return d.map(function(d,i){
									var point=[d.x,d.y];
									return point.join(",");
								}).join(" ");
							})
							.attr('fill',color)
							.attr('opacity',0)
							.transition()
							.duration(1000)
							.ease("linear")
							.attr("opacity",op);
		}
	}
}
function zoomed()
{
	d3.select(this)
	  .attr("transform",
	  	'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
}
function draw_background()
{
	d3.select("body")
	  .append("svg")
	  .attr("class","circles")
	  .attr("width", width_c)
	  .attr("height", height_c)
	  .style("position","absolute")
	  .style("left",1050)
	  .style("top",30);

	var svg=d3.select("body").select(".circles");
	
    var xAxis=d3.svg.axis()
    			   .scale(xScale)
    			   .orient("bottom");
    
    var yAxis=d3.svg.axis()
    				.scale(yScale)
    				.orient("left");
    svg.append("g")
       .attr("class","axis")
       .attr("transform","translate("+padding.left+","+(height_c-padding.bottom)+")")
       .call(xAxis);
    svg.append("g")
       .attr("class","axis")
       .attr("transform","translate("+padding.left+","+(height_c-padding.bottom-yAxisWidth)+")")
       .call(yAxis);
    var circles=svg.append("g")
       			   .attr("class","emo_circles");
    for(var i=0;i<7;i++)
    {
    	circles.append("g")
    		   .attr("class",emotion_array[i]+"_circles");
    }
    draw_label();
	draw_scratch();
}
function draw_scratch()
{
	var svg=d3.select("body")
			  .select(".circles");

	var lines=svg.append("g")
    			 .attr("class","drag_line");
    var drag_across=d3.behavior.drag()
    				  .on("drag",function(){
    				  	position[1]=d3.event.y;
    				  	d3.select("#coord")
		    		   	  .html("("+Math.round(xScale.invert(position[0]-padding.left))+","+Math.round(yScale.invert(500-padding.bottom-position[1]))+")");
    				  	d3.select(this)
    				  	  .attr("y1",d3.event.y)
    				  	  .attr("y2",d3.event.y);
    				  	d3.select("#circle_center")
    				  	  .attr("cy",d3.event.y);

						var center=tran_scale(position);
    				  	d3.select("#map_circle")
    				  	  .attr("cy",center[1]);
    				  });
    lines.append("line")
         .attr("id","line_across")
         .attr("x1",padding.left)
         .attr("x2",padding.left+xAxisWidth)
         .attr("y1",position[1])
         .attr("y2",position[1])
         .attr("stroke","#D3D3D3")
         .attr("stroke-width",1)
         .call(drag_across);

    var drag_vertical=d3.behavior.drag()
    					.on("drag",function(){
    						position[0]=d3.event.x;
    				  		d3.select("#coord")
		    		   	  	  .html("("+Math.round(xScale.invert(position[0]-padding.left))+","+Math.round(yScale.invert(500-padding.bottom-position[1]))+")");
    						d3.select(this)
    						  .attr("x1",d3.event.x)
    						  .attr("x2",d3.event.x);
    						d3.select("#circle_center")
    						  .attr("cx",d3.event.x);

    						var center=tran_scale(position);
	    				  	d3.select("#map_circle")
	    				  	  .attr("cx",center[0]);
    					});
    lines.append("line")
    	 .attr("id","line_vertical")
         .attr("x1",position[0])
         .attr("x2",position[0])
         .attr("y1",height_c-padding.bottom-yAxisWidth)
         .attr("y2",height_c-padding.bottom)
         .attr("stroke","#D3D3D3")
         .attr("stroke-width",1)
         .call(drag_vertical);
    var drag_circle=d3.behavior.drag()
		    		   .on("drag",function(){
		    		   	d3.select(this)
		    		   	  .attr("cx",d3.event.x)
		    		   	  .attr("cy",d3.event.y);
		    		   	d3.select("#line_across")
		    		   	  .attr("y1",d3.event.y)
		    		   	  .attr("y2",d3.event.y);
		    		   	d3.select("#line_vertical")
		    		   	  .attr("x1",d3.event.x)
		    		   	  .attr("x2",d3.event.x);
		    		   	position[0]=d3.event.x;
		    		   	position[1]=d3.event.y;
		    		   	d3.select("#coord")
		    		   	  .html("("+Math.round(xScale.invert(position[0]-padding.left))+","+Math.round(yScale.invert(500-padding.bottom-position[1]))+")");

		    		   	var center=tran_scale(position);
    				  	d3.select("#map_circle")
    				  	  .attr("cx",center[0])
    				  	  .attr("cy",center[1]);
		    		   });
    lines.append("circle")
    	 .attr("id","circle_center")
         .attr("cx",position[0])
         .attr("cy",position[1])
         .attr("r",20)
         .attr("fill-opacity",0)
         .call(drag_circle);
}
function sort_score(score,color,emo_type)
{
	var sql_content='select max(happy) from (';
	sql_content+='select happy from score ';
	sql_content+='union select like from score ';
	sql_content+='union select fear from score ';
	sql_content+='union select shock from score ';
	sql_content+='union select sad from score ';
	sql_content+='union select dislike from score ';
	sql_content+='union select anger from score)';
	var content={'sql':sql_content, 'database': database};
	post("/upload", content, function(retdata){
		draw_circles(score,color,emo_type,retdata[0][0]);
		if(emo_type=="anger")
		{
			d3.select("#max_score")
			  .html(retdata[0][0]);
		}
	});
}
function draw_circles(score,color,emo_type,maxScore)
{
	var center_array=new Array();
	for (var i=0; i<40/sq; i++)
	{
		for(var j=0; j<70/sq; j++)
		{
			var x=i*sq+15;
			var y=j*sq+70;
			if(score[i][j]!=0)
			{
				var center=[x+1,y+1,score[i][j]];
				center_array.push(center);
			}
		}
	}
	var svg=d3.select("."+emo_type+"_circles");

    // var max=d3.max(center_array,function(d){
    // 	return d[2];
    // });
	yScale.range([0,yAxisWidth]);
	var circle=svg.selectAll("circle")
				  .data(center_array)
				  .enter()
				  .append("circle")
				  .attr("fill",color)
				  .attr("cx",function(d){
				  	var random=Math.random();
				  	if(random>0.5)
				  		return padding.left+xScale(d[1])+(random-0.5)*20;
				  	else
				  		return padding.left+xScale(d[1])+random*20;
				  })
				  .attr("cy",function(d){
				  	var random=Math.random();
				  	//console.log(d[0],yScale(d[0]));
				  	if(random>0.5)
				  		return 500-padding.bottom-yScale(d[0])+(random-0.5)*20;
				  	else
				  		return 500-padding.bottom-yScale(d[0])+random*20;
				  })
				  .attr("r",function(d){
				  	if(Math.log(d[2])/Math.log(maxScore)*15<1)
				  		return 1;
				  	else
				  		return Math.log(d[2])/Math.log(maxScore)*15;
				  })
				  .attr("fill-opacity",0.3)
				  .attr("stroke",color)
				  .attr("stroke-width",1)
				  .attr("stroke-opacity",1)
				  .on("mouseover",function(d){
				  	if(click_num%2==0)
				  	{
				  		d3.select("."+emo_type+"_circles")
					  	  .selectAll("circle")
					  	  .attr("fill-opacity",0.7);
					  	for(var p in colormap)
					  	{
					  		if(p!=emo_type)
					  		{
					  			d3.select("."+p+"_circles")
					  			  .selectAll("circle")
					  			  .attr("fill-opacity",0.1)
					  			  .attr("stroke-opacity",0.1);
					  		}
					  	}
				  	}
				  })
				  .on("mouseout",function(d){
				  	if(click_num%2==0)
				  	{
				  		for(var p in colormap)
					  	{
					  		d3.select("."+p+"_circles")
					  		  .selectAll("circle")
					  		  .attr("fill-opacity",0.3)
					  		  .attr("stroke-opacity",1);
					  	}
				  	}
				  });
}
function draw_label(maxScore)
{
	var svg=d3.select("body")
			  .select(".circles")
			  .append("g")
			  .attr("class","label");
    svg.append("text")
       .html("Number of Emotion")
       .attr("x",60)
       .attr("y",380)
       .attr("font-size",10);
	svg.append("circle")
	    .attr("cx",100)
	    .attr("cy",400)
	    .attr("r",15)
	    .attr("fill-opacity",0)
	    .attr("stroke","black")
	    .attr("stroke-dasharray","5,5");
	svg.append("text")
	   .attr("x",60)
	   .attr("y",398)
	   .attr("font-size",10)
	   .attr("id","max_score")
	   .html(0);
	svg.append("line")
	   .attr("x1",60)
	   .attr("x2",85)
	   .attr("y1",400)
	   .attr("y2",400)
	   .attr("stroke","black")
	   .attr("stroke-width",0.5);
	svg.append("text")
	   .attr("x",60)
	   .attr("y",413)
	   .attr("font-size",10)
	   .html(0);
	svg.append("line")
	   .attr("x1",60)
	   .attr("x2",100)
	   .attr("y1",415)
	   .attr("y2",415)
	   .attr("stroke","black")
	   .attr("stroke-width",0.5);

	var x0=xScale.invert(position[0]-padding.left);
	var y0=yScale.invert(500-padding.bottom-position[1]);
	svg.append("text")
	   .attr("id","coord")
	   .attr("x",60)
	   .attr("y",430)
	   .html("("+x0+","+y0+")")
	   .attr("font-size",10);

}
function map_circle()
{
	//circle in map
	var center=tran_scale(position);
	var drag_circle=d3.behavior.drag()
		    		   .on("drag",function(){
		    		   	//console.log(d3.event.x,d3.event.y);
		    		   	var center_pro=projection.invert([d3.event.x,d3.event.y]);
		    		   	var x0=padding.left+xScale(center_pro[0]);
		    		   	var y0=500-padding.bottom-yScale(center_pro[1]);
		    		   	d3.select(this)
		    		   	  .attr("cx",d3.event.x)
		    		   	  .attr("cy",d3.event.y);
		    		   	d3.select("#line_across")
		    		   	  .attr("y1",y0)
		    		   	  .attr("y2",y0);
		    		   	d3.select("#line_vertical")
		    		   	  .attr("x1",x0)
		    		   	  .attr("x2",x0);
		    		   	d3.select("#circle_center")
		    		   	  .attr("cx",x0)
		    		   	  .attr("cy",y0);
		    		   	d3.select("#coord")
		    		   	  .html("("+Math.round(center_pro[0])+","+Math.round(center_pro[1])+")");
		    		   });
	d3.select("body")
	  .select(".map")
	  .select("g")
	  .append("circle")
	  .attr("id","map_circle")
	  .attr("cx",center[0])
	  .attr("cy",center[1])
	  .attr("r",8)
	  .attr("fill","#DB7093")
	  .attr("fill-opacity",0.6)
	  .attr("stroke","#DB7093")
	  .attr("stroke-opacity",1)
	  .call(drag_circle);
}
function get_topic(emo_type,x,y)
{
	var sql_content="select noun_"+emo_type+" from score where x="+x+" and y="+y;

	var content={'sql':sql_content,'database':database};
	post("/upload", content, function(retdata){
		var topic_list=new Object();
		topic_list.word=new Array();
		topic_list.num=new Array();
		var words=retdata[0][0].split(",");
		for(var i=0;i<words.length;i++)
		{
			if((words[i].length>1)&&(words[i]!="全文"))
			{
				if(topic_list.word.length==0)
				{
					topic_list.word.push(words[i]);
					topic_list.num.push(0);
				}
				else
				{
					for(var j=0;j<topic_list.word.length;j++)
					{
						if(topic_list.word[j]==words[i])
						{
							topic_list.num[j]+=1;
							break;
						}
					}
					if(j==topic_list.word.length)
					{
						topic_list.word.push(words[i]);
						topic_list.num.push(1);
					}
				}
			}
		}
		var topic=new Array();
		for(var i=0;i<topic_list.num.length;i++)
		{
			for(var j=0;j<emotion_list.length;j++)
			{
				if(topic_list.word[i]==emotion_list[j])
				{
					topic_list.num[i]=0;
					//console.log(topic_list.word[i]);
					break;
				}
			}
		}
		//console.log(topic_list);
		var max=d3.max(topic_list.num);
		if(max>1)
		{
			for(var i=0;i<topic_list.num.length;i++)
			{
				if(topic_list.num[i]==max)
					topic.push(topic_list.word[i]);
			}
		}
		//console.log(topic.length);
		//console.log(topic);
		if(topic.length>0)
			draw_tooltip(x,y,topic);
	});
}
function draw_tooltip(x,y,topic)
{
	var coord=new Object();
	coord.x=x+1;
	coord.y=y+1;
	var position=tran_coord(coord,projection);
	var div=d3.select(".topic")
			  //.append("circle")
			  .append("div")
			  .attr("class","tooltip top")
			  .attr("role","tooltip")
			  .style("position","absolute")
			  .style("left",position.x-25+"px")
	  		  .style("top",position.y+"px");

	div.append("div")
	  .attr("class","tooltip-arrow");
	div.append("div")
	  .attr("class","tooltip-inner")
	  .html(topic[0])
	  .on("mouseover",function(){
	  	var topic_str="";
	  	for(var i=0;i<topic.length;i++)
	  	{
	  		if(i<topic.length-1)
	  			topic_str=topic_str+topic[i]+",";
	  		else
	  			topic_str=topic_str+topic[i];
	  	}
	  	d3.select(this)
	  	  .html(topic_str);
	  })
	  .on("mouseout",function(){
	  	d3.select(this)
	  	  .html(topic[0]);
	  });
	  
	  //.attr("r",20);
}
function change_time()
{
	d3.select(".areas")
	  .selectAll("polygon")
	  .remove();
	get_data("all",1);
	emotion_now="all";
	d3.select(".emo_circles")
	  .selectAll("circle")
	  .remove();
	d3.select("#map_circle")
	  .remove();
	get_data("happy",2);
	get_data("like",2);
	get_data("fear",2);
	get_data("shock",2);
	get_data("sad",2);
	get_data("dislike",2);
	get_data("anger",2);
}
function update()
{
	var number=parseInt(time_now[4])+1;
	//console.log(number);
	if(number>8) number=1;
	time_now="time"+number;

	d3.selectAll(".line_circle")
	  .style("fill","white");
	d3.select("#"+time_now)
	  .style("fill","#A9A9A9");
	for(var i=1;i<5;i++)
	{
		d3.select(".areas")
		  .select(".layer"+i)
		  .selectAll("polygon")
		  .transition()
		  .duration(1000)
		  .ease("linear")
		  .attr("opacity",0)
		  .remove();
	}
	d3.select("#map_circle")
	  .remove();

	database=database_list[time_now];
	get_data(emotion_now,1);
}
function load_page()
{
	draw_map(0,30);
	get_data("all",1);
	get_data("happy",2);
	get_data("like",2);
	get_data("fear",2);
	get_data("shock",2);
	get_data("sad",2);
	get_data("dislike",2);
	get_data("anger",2);

	draw_background();
}