class emotionsGeneva {
    //merci beaucoup à https://observablehq.com/@d3/donut-chart
	// en référence à https://www.researchgate.net/publication/280880848_Geneva_Emotion_Wheel_Rating_Study
	//pour les emoji https://unicode.org/emoji/charts/full-emoji-list.html
	constructor(params) {
        var me = this;
        this.cont = d3.select("#"+params.idCont);
        this.width = params.width ? params.width : 400;
        this.height= params.height ? params.height : this.width;
        this.callback = params.callback ? params.callback : null;
        this.data = params.data ? params.data : [];
		this.emos = params.emos ? params.emos : [];
		this.emoji = params.emoji ? params.emoji : true;
		this.interpolateColor = params.interpolateColor ? params.interpolateColor : d3.interpolateSinebow;
		
        var svg, color, radius, arc, arcCentroid, arcLabel, arcs, pie, scRadius, emos=[];
		if(!this.emos.length){
			this.emos = [				
				{'c':'#fa0204','n':'fierté','i':'😊'},
				{'c':'#e38700','n':'allégresse','i':'😇'},
				{'c':'#f8881a','n':'joie','i':'😀'},
				{'c':'#fbfd00','n':'satisfaction','i':'🙂'},
				{'c':'#ebfe0f','n':'soulagement','i':'😌'},
				{'c':'#b6f603','n':'espoir','i':'🤗'},
				{'c':'#52dc00','n':'intérêt','i':'🤔'},
				{'c':'#0bad00','n':'suprise','i':'😮'},
				{'c':'#00f98a','n':'tristesse','i':'😢'},
				{'c':'#01f7e2','n':'peur','i':'😱'},
				{'c':'#45b3b9','n':'honte','i':'😳'},
				{'c':'#569ec0','n':'culpabilité','i':'😟'},
				{'c':'#1e1ce4','n':'envie','i':'🤨'},
				{'c':'#4403ff','n':'dégout','i':'🤢'},
				{'c':'#aa348b','n':'mépris','i':'🙄'},
				{'c':'#c13b6c','n':'colère','i':'😡'}
			];
		}
		this.init = function () {
			//définie le tableau des cercles
			for (let i = 0; i < 5; i++) {
				me.data.push({'r':me.width/(5+i),'cercles':[]});
				for (let j = 0; j < this.emos.length; j++) {
					//let c = d3.color(arrColor[j]).copy({opacity: 1/i});
					let c = d3.color(this.emos[j].c).darker(i);
					let n = this.emos[j].n;
					if(j!=0)n += ' - '+i
					let id = this.emos[j].id ? this.emos[j].id : i+'-'+j;
					me.data[i].cercles.push({'value':1,'couche':i+2,'name':n,'id':id,'color':c});
				}				
			}
			//définie les paramètres et fonction d'affichage
			radius = Math.min(me.width, me.height) / 2;
			scRadius = d3.scaleBand()
				.domain([7, 6, 5, 4, 3, 2, 1, 0])
				.paddingInner(0.3)
				.paddingOuter(0.2)
				.range([0, radius]);
			arc = function(d,e){
				return d3.arc().innerRadius(scRadius(d.data.couche))
				.outerRadius(scRadius.bandwidth()+scRadius(d.data.couche))
				.padAngle(d.padAngle)
				.startAngle(d.startAngle)
    			.endAngle(d.endAngle)();
			}			
			arcCentroid = function(d,e){
				let c =  d3.arc().innerRadius(scRadius(d.data.couche))
				.outerRadius(scRadius.bandwidth()+scRadius(d.data.couche))
				.padAngle(d.padAngle)
				.startAngle(d.startAngle)
    			.endAngle(d.endAngle).centroid(d);
				return 'translate('+c[0]+','+c[1]+')'
			}			
			arcLabel = function(d,e){
				return d3.arc().innerRadius(scRadius(0)-12)
				.outerRadius(scRadius(0)-12)
				.padAngle(d.padAngle)
				.startAngle(d.startAngle)
    			.endAngle(d.endAngle)();
			}			
			pie = d3.pie()
				.padAngle(0.05)
				.sort(null)
				.value(d => d.value)
			color = d3.scaleSequential().domain([0,20])
				.interpolator(me.interpolateColor);
	
			//ajoute les éléments graphiques
			svg = me.cont.append("svg")
				.attr("viewBox", [-me.width / 2, -me.height / 2, me.width, me.height]);

			//construction des repères
			svg.append('rect')
				.attr("x", -me.width / 2)
				.attr("y", -me.height / 2)
				.attr("width", me.width)
				.attr("height", me.height)
				.attr("stroke", "white");
			let lineNS = d3.path();
				lineNS.moveTo(0, (-me.height / 2)+scRadius.bandwidth());
    		    lineNS.lineTo(0, (me.height / 2)-scRadius.bandwidth());    
			svg.append('path')
				.attr('d',lineNS.toString())
				.attr("stroke", "white");
			let lineWE = d3.path();
				lineWE.moveTo((-me.width / 2)+scRadius.bandwidth(), 0);
				lineWE.lineTo((me.width / 2)-scRadius.bandwidth(), 0);    
			svg.append('path')
				.attr('d',lineWE.toString())
				.attr("stroke", "white");
			svg.append('circle')
				.attr('r',radius-scRadius.bandwidth()*2.5)
				.attr("x", 0)
				.attr("y", 0)
				.attr("fill", 'none')
				.attr("stroke", "white");
			svg.append('text')
				.attr("font-family", "sans-serif")
				.attr("font-size", 12)
				.attr("text-anchor", "middle")
				.attr("x", 0)
				.attr("y", (-me.height / 2)+12)
				.attr("fill", "white")
				.text('contrôle +');
			svg.append('text')
				.attr("font-family", "sans-serif")
				.attr("font-size", 12)
				.attr("text-anchor", "middle")
				.attr("x", 0)
				.attr("y", (me.height / 2)-2)
				.attr("fill", "white")
				.text('contrôle -');
			svg.append('text')
				.attr("font-family", "sans-serif")
				.attr("font-size", 12)
				.attr("text-anchor", "middle")
				.attr("fill", "white")
				.attr("transform", "translate("+(12-me.width / 2)+",0) rotate(-90)")
				.text('déplaisant');
			svg.append('text')
				.attr("font-family", "sans-serif")
				.attr("font-size", 12)
				.attr("text-anchor", "middle")
				.attr("fill", "white")
				.attr("transform", "translate("+(-12+me.width / 2)+",0) rotate(90)")
				.text('plaisant');
	
			//construction des définitions de path pour les textes extérieurs
			let defs = svg.append('defs');
			defs.selectAll('path').data(pie(me.data[0].cercles)).enter().append('path')
				.attr('id',(d,i)=>'arcLabel'+i)
				.attr('stroke','red')
				.attr('d',arcLabel);
			//construction des labels
			let arcLabelTxt = svg.selectAll('.arcLabelTxt').data(this.emos).enter().append('text')
				.attr('class','arcLabelTxt')
				.attr("font-family", "sans-serif")
				.attr("font-size", me.emoji ? scRadius.bandwidth()*2 : 10)
				.attr('text-anchor','middle')
				.attr("fill", "white")
				.append('textPath')
					.attr('href',(d,i)=>'#arcLabel'+i)
					.attr('startOffset','26')
					.text(d=> me.emoji ? d.i: d.n);

			//construction des couches
			let couches = svg.selectAll('g').data(me.data).enter().append('g')
				.attr('class',(d,i)=>'coucheEmo_'+i);
		  
			couches.selectAll("path")
			  .data(d=>pie(d.cercles))
			  .join("path")
				.attr("fill", d => d.data.color/*color(d.data.color)*/)
				.attr("d",arc)
			  .append("title")
				.text(d => d.data.name);		

		}
		me.init();
	}		
}

  
