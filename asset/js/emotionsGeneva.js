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
        this.clickResult = params.clickResult ? params.clickResult : console.log;
		this.emos = params.emos ? params.emos : [];
		this.emoji = params.emoji ? params.emoji : true;
		this.interpolateColor = params.interpolateColor ? params.interpolateColor : d3.interpolateSinebow;
		this.correction = true;
		this.selectEmos = [];
        var svg, gMain, color, radius, arc, arcCentroid, arcLabel, arcs, pie, scRadius, emos=[]
		, animeClignote, animeClignoteTarget, curDoc=false, dataResult, emosById=[];
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
			//construction du tableau des id pour faciliter la réutilisation
			this.emos.forEach((e,i)=>{
				e.ordre= i<10 ? '0'+i : i;
				emosById[e.id]=e
			});

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
				.style("width", "100%")
				.style("height", "auto")
				.attr("viewBox", [-me.width / 2, -me.height / 2, me.width, me.height]);
			gMain = svg.append('g').attr('id','emotionGenevaCrible');
			

			//construction des repères
			gMain.append('rect')
				.attr("x", -me.width / 2)
				.attr("y", -me.height / 2)
				.attr("width", me.width)
				.attr("height", me.height)
				.attr("stroke", "white");
			let lineNS = d3.path();
				lineNS.moveTo(0, (-me.height / 2)+scRadius.bandwidth());
    		    lineNS.lineTo(0, (me.height / 2)-scRadius.bandwidth());    
			gMain.append('path')
				.attr('d',lineNS.toString())
				.attr("stroke", "white");
			let lineWE = d3.path();
				lineWE.moveTo((-me.width / 2)+scRadius.bandwidth(), 0);
				lineWE.lineTo((me.width / 2)-scRadius.bandwidth(), 0);    
			gMain.append('path')
				.attr('d',lineWE.toString())
				.attr("stroke", "white");
			gMain.append('circle')
				.attr('r',radius-scRadius.bandwidth()*2.5)
				.attr("x", 0)
				.attr("y", 0)
				.attr("fill", 'none')
				.attr("stroke", "white");
			gMain.append('text')
				.attr("font-family", "sans-serif")
				.attr("font-size", 12)
				.attr("text-anchor", "middle")
				.attr("x", 0)
				.attr("y", (-me.height / 2)+12)
				.attr("fill", "white")
				.text('contrôle +');
			gMain.append('text')
				.attr("font-family", "sans-serif")
				.attr("font-size", 12)
				.attr("text-anchor", "middle")
				.attr("x", 0)
				.attr("y", (me.height / 2)-2)
				.attr("fill", "white")
				.text('contrôle -');
			gMain.append('text')
				.attr("font-family", "sans-serif")
				.attr("font-size", 12)
				.attr("text-anchor", "middle")
				.attr("fill", "white")
				.attr("transform", "translate("+(12-me.width / 2)+",0) rotate(-90)")
				.text('déplaisant');
			gMain.append('text')
				.attr("font-family", "sans-serif")
				.attr("font-size", 12)
				.attr("text-anchor", "middle")
				.attr("fill", "white")
				.attr("transform", "translate("+(-12+me.width / 2)+",0) rotate(90)")
				.text('plaisant');
	
			//construction des définitions de path pour les textes extérieurs
			let defs = gMain.append('defs');
			defs.selectAll('path').data(pie(me.data[0].cercles)).enter().append('path')
				.attr('id',(d,i)=>'arcLabel'+i)
				.attr('stroke','red')
				.attr('d',arcLabel);
			//construction des labels
			let arcLabelTxt = gMain.selectAll('.arcLabelTxt').data(this.emos).enter().append('text')
				.attr('class','arcLabelTxt')
				.attr("id",d=>'arcLabel'+d.id)
				.attr("font-family", "sans-serif")
				.attr("font-size", me.emoji ? scRadius.bandwidth()*2 : 10)
				.attr('text-anchor','middle')
				.attr("fill", "white")
				.append('textPath')
					.attr('href',(d,i)=>'#arcLabel'+i)
					.attr('startOffset','26')
					.text(d=> me.emoji ? d.i: d.n);

			//construction des couches
			let couches = gMain.selectAll('g').data(me.data).enter().append('g')
				.attr('class',(d,i)=>'coucheEmo_'+i);
		  
			couches.selectAll("path")
			  .data(d=>pie(d.cercles))
			  .join("path")
				.attr("class",'pCoucheEmo')
				.attr("id",d=>'emo'+d.data.id+'_'+d.data.couche+'couche')
				.attr("fill", d => d.data.color/*color(d.data.color)*/)
				.attr('stroke','white')
				.attr('stroke-width',0)				
				.attr("d",arc)
				.on('click',selectEmo)
			  .append("title")
				.text(d => d.data.name);		

		}

		function selectEmo(e,d){
			if(!me.correction || !curDoc)return;
			let emo = d3.select(e.currentTarget)
			if(emo.attr('stroke-width')==0){
				emo.attr('stroke-width',3);
				me.selectEmos[curDoc['o:id']].cor.push(d);
			}else{
				emo.attr('stroke-width',0);
				for( var i = 0; i < me.selectEmos[curDoc['o:id']].cor.length; i++){     
					if ( me.selectEmos[curDoc['o:id']][i].data.id === d.data.id) { 				
						me.selectEmos[curDoc['o:id']].cor.splice(i, 1); 
					}				
				}				
			} 
		}

		this.showDocEmotion = function (calculs, doc) {
			curDoc = doc
			if(!me.selectEmos[curDoc['o:id']])me.selectEmos[curDoc['o:id']]={'idDoc':curDoc['o:id'],'emo':false,'x':false,'y':false,'degre':false,'cor':[]};

			let evals  = calculs.details.filter(d=>d.doc == doc['o:id']);
			let scEmo = d3.scaleQuantize()
				.domain([0, 360])
				.range(this.emos);
			//récupère les concepts pour l'angle
			let controle = evals.filter(e=>e.crible==6558 && e.cpt==6551)[0];
			if(!controle)controle={'val':0};
			let valence = evals.filter(e=>e.crible==6552 && e.cpt==6554)[0];
			if(!valence)valence={'val':0};
			//calcul l'angle
			let degre = ((Math.atan2(valence.val-50, controle.val-50)* (180 / Math.PI)) + 360) % 360;
			//récupère l'emotion
			let emo = scEmo(degre);
			me.selectEmos[curDoc['o:id']].x=controle.val;
			me.selectEmos[curDoc['o:id']].y=valence.val;
			me.selectEmos[curDoc['o:id']].degre=degre;
			me.selectEmos[curDoc['o:id']].emo=emo;
			//enleve les clignotements
			if(animeClignote){
				animeClignote.remove(animeClignoteTarget);
				d3.select(animeClignoteTarget).style('opacity',1);
			}			
			//fait clignoter l'émotion
			clignote('#arcLabel'+emo.id);
			//déconnecte les couches
			d3.selectAll('.pCoucheEmo').attr('stroke-width',0);										
			//montre les couches sélectionnées
			me.selectEmos[curDoc['o:id']].cor.forEach(e => {
				let c = d3.selectAll('#emo'+e.data.id+'_'+e.data.couche+'couche').attr('stroke-width',3);				
				//console.log(c);
			});

		}

		function clignote(t){
			animeClignoteTarget = t;
			animeClignote = anime({
				targets: t,
				opacity: 0,
				loop: true,
				direction: 'alternate',
				easing: 'easeInOutCirc',
			  });
		}	

		this.removeDiagrammeChord = function(){
			svg.select('#emotionGenevaChord').remove();
		}

		this.diagrammeResult = function(data){
			dataResult=data;
			//ordonne les résultats pour respecter la roue
			dataResult.sort(function (a, b) {
				return emosById[a.idEmo].ordre - emosById[b.idEmo].ordre;
			  });

			//enlève le diagramme emotion Geneva
			svg.select('#emotionGenevaCrible').remove();

			//construction du diagramme
			gMain = svg.append('g').attr('id','emotionGenevaResult');
			
			let outerRadius = Math.min(me.width, me.height) / 2;
			let innerRadius = 100;
			//définitiion des regroupements
			let cols = ['Actants','Documents','Evaluations','Corrections','Importance'];						
			let z = d3.scaleOrdinal()
				.domain(cols)
				//.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"]);
				.range(["#feff32", "#974ea3", "#f781bf", "#ff7f00", "#4daf4a"]);
			let x = d3.scaleBand()
				.domain(data.map(d => d.ico))
				.range([0, 2 * Math.PI])
				.align(0);
			let y = d3.scaleRadial()
				.domain([0, d3.max(data, d => d.total)])
				.range([innerRadius, outerRadius]);
			let arc = d3.arc()
				.innerRadius(d => y(d[0]))
				.outerRadius(d => y(d[1]))
				.startAngle(d => x(d.data.ico))
				.endAngle(d => x(d.data.ico) + x.bandwidth())
				.padAngle(0.01)
				.padRadius(innerRadius);
		
			gMain.selectAll("g")
				//.data(d3.stack().keys(data.columns.slice(1))(data))
				.data(d3.stack().keys(cols)(data))
				.join("g")
					.attr("class", d => d.key)
					.attr("fill", d => z(d.key))
				.selectAll("path")
				.data(d => d)
				.join("path")
					.attr("d", arc)
					.attr("id", d=> d.data.idEmo+'_'+d[0]+'_'+d[1])
					.attr("class", 'coucheStatEmo')
					.on('click',me.clickResult);
		
			let	xAxis = g => g
				.attr("text-anchor", "middle")
				.call(g => g.selectAll("g")
					.data(data)
					.join("g")
					.attr("transform", d => `
						rotate(${((x(d.ico) + x.bandwidth() / 2) * 180 / Math.PI - 90)})
						translate(${innerRadius},0)
					`)
				.call(g => g.append("line")
					.attr("x2", -5)
					.attr("stroke", "#000"))
				.call(g => g.append("text")
					.attr("font-family", "sans-serif")
					.attr("font-size",18)
					.attr("id",d=>'emo'+d.idEmo)
					.attr("transform", d => (x(d.ico) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI
						? "rotate(90)translate(0,20)"
						: "rotate(-90)translate(0,-9)")
					.text(d => d.ico)));
				
			let yAxis = g => g
				.attr("text-anchor", "middle")
				.call(g => g.append("text")
					.attr("font-family", "sans-serif")
					.attr("font-size", 10)
					.attr("y", d => -y(y.ticks(5).pop()))
					.attr("dy", "-1em")
					.text("Nb éléments"))
				.call(g => g.selectAll("g")
					.data(y.ticks(5).slice(1))
					.join("g")
					.attr("fill", "none")
				.call(g => g.append("circle")
					.attr("stroke", "#000")
					.attr("stroke-opacity", 0.5)
					.attr("r", y))
				.call(g => g.append("text")
					.attr("y", d => -y(d))
					.attr("dy", "0.35em")
					.attr("font-family", "sans-serif")
					.attr("font-size", 10)
					//.attr("stroke", "#fff")
					//.attr("stroke-width", 5)
					.text(y.tickFormat(5, "s"))
					.clone(true)
					.attr("fill", "white")
					.attr("stroke", "none")));
			let legend = g => g.append("g")
				.selectAll("g")
				.data(cols.reverse())
				.join("g")
					.attr("transform", (d, i) => `translate(-40,${(i - (cols.length - 1) / 2) * 20-10})`)
				.call(g => g.append("rect")
					.attr("width", 18)
					.attr("height", 18)
					.attr("fill", z))
				.call(g => g.append("text")
					.attr("x", 24)
					.attr("y", 9)
					.attr("font-family", "sans-serif")
					.attr("font-size", 10)
					.attr("fill", "white")
					.attr("dy", "0.35em")
					.text(d => d));

			gMain.append("g")
				.call(xAxis);
		
			gMain.append("g")
				.call(yAxis);
		
			gMain.append("g")
				.call(legend);
		}
		this.showDocResult = function (t, doc) {
			if(!doc)return;
			//récupère les emotions du document dans l'ensemble des récultats
			let emosDoc = [], dSlt=t.d.data, idEmoDoc = parseInt(emosById[dSlt.idEmo].ordre);
			dataResult.forEach(emo=>{
				let refEmo = emosById[emo.idEmo], docEmo;
				//vérifie si le doc est dans les corrections
				emo.cor.forEach(cor=>{
					if(cor.docs==doc['o:id']){
						emosDoc.push({'source':emosById[cor.cptOriId].ordre+'-'+emosById[cor.cptOriId].n
							,'target':emosById[cor.cptId].ordre+'-'+emosById[cor.cptId].n
							,'value':1, 'type':'cor', 'ordre':refEmo.ordre});
					}
				})
				//vérifie si le doc est dans le process
				emo.process.forEach(p=>{
					p.docs.forEach(pd=>{
						if(pd==doc['o:id']){
							docEmo = emosById[dSlt.idEmo];
							emosDoc.push({'source':docEmo.ordre+'-'+docEmo.n,'target':refEmo.ordre+'-'+refEmo.n,'value':1, 'type':'pro', 'ordre':refEmo.ordre});
						}
					})
				})
			})
			//ajoute les rapports vides
			emosById.forEach(e=>emosDoc.push({'source':e.ordre+'-'+e.n,'target':e.ordre+'-'+e.n,'value':1, 'type':'vide', 'ordre':e.ordre}));				

			//construction des relations
			//console.log(emosDoc);
			let names = Array.from(new Set(emosDoc.flatMap(d => [d.source, d.target]))).sort(d3.ascending)
			let index = new Map(names.map((name, i) => [name, i]));
			let matrix = Array.from(index, () => new Array(names.length).fill(0));
			for (const {source, target, value} of emosDoc) matrix[index.get(source)][index.get(target)] += value;
			//console.log(matrix);

			//enlève les chords
			svg.select('#emotionGenevaChord').remove();
			let gChords = svg.append('g').attr('id','emotionGenevaChord');
			let innerRadius = 70, outerRadius = 75;

			//ajoute le cercle de fond
			gChords.append("circle")
				.attr("fill", 'white')
				.attr('cx',0)
				.attr('cy',0)
				.attr("r", innerRadius);			

			let chord = d3.chordDirected()
				.padAngle(10 / innerRadius)
				.sortSubgroups(d3.descending)
				.sortChords(d3.descending);
			let chords = chord(matrix);
			let arc = d3.arc()
				.innerRadius(innerRadius)
				.outerRadius(outerRadius);			
			let	ribbon = d3.ribbonArrow()
				.radius(innerRadius - 1)
				.padAngle(1 / innerRadius);

			let group = gChords.append("g")
					.attr("font-size", 10)
					.attr("font-family", "sans-serif")
				  .selectAll("g")
				  .data(chords.groups)
				  .join("g");
			  
			group.append("path")
				.attr("fill", d => color(names[d.index]))
				.attr("d", arc);
			/*pas nécessaire car déjà présent dans l'autre diagramme
			group.append("text")
				.each(d => (d.angle = (d.startAngle + d.endAngle) / 2))
				.attr("dy", "0.35em")
				.attr("fill", "white")
				.attr("transform", d => `
					rotate(${(d.angle * 180 / Math.PI - 90)})
					translate(${outerRadius + 5})
					${d.angle > Math.PI ? "rotate(180)" : ""}
				`)
				.attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
				.text(d => names[d.index]);
			*/  
			group.append("title")
					.text(d => `${names[d.index]}
			  ${d3.sum(chords, c => (c.source.index === d.index) * c.source.value)} outgoing →
			  ${d3.sum(chords, c => (c.target.index === d.index) * c.source.value)} incoming ←`);
			  
			gChords.append("g")
				.attr("fill-opacity", 0.75)
				  .selectAll("path")
				  .data(chords)
				  .join("path")
					.style("mix-blend-mode", "multiply")
					.attr("fill", d => {
						if(d.target.index==d.source.index && d.source.index!=idEmoDoc)return 'white';
						else return this.emos[d.target.index].c;
					})
					.attr("d", ribbon)
				  .append("title")
					.text(d => `${names[d.source.index]} → ${names[d.target.index]} ${d.source.value}`);
		}

		me.init();
	}		
}

  
