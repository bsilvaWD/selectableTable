var selectTable = selectTable || {};

/***************************************************************************
 *                      MISC functions && settings                         *
 ***************************************************************************/    
(function(myself){


	/* ******** Project Specific instantiations: START ****** */

	myself.selectableTable_addInSetting = function(tableComp,
											selectionListName,selectAllParamName,
											updateCountersEventName,selectedCountParamName,
											totalCountParamName,selectableColIdx){

		// Defaults for table render:

		// - selectAll inactive
//		Dashboards.setParameter(selectAllParamName,false);

		// - reset Total counts:
//		selectTable.resetTotalsCount(totalCountParamName);

		// - reset Selected counts and clean selection list:
//		selectTable.clearSelection(selectionListName,selectAllParamName,selectedCountParamName);
//		Dashboards.fireChange(updateCountersEventName,$.now());

		// Select item AddIn
		var selectOpts = {
		    getSelectList: function(){
		        return Dashboards.getParameterValue(selectionListName);
		    },
		    getSelectAllStatus: function(){
		        return Dashboards.getParameterValue(selectAllParamName);
		    },        
		    buttons: [
		        {
		            id: "selectBtn",
		            cssClass: "selectBox",
		            selectedCssClass: "selected",
		            title: "",
		            action: function (v, st) {
		                var list = Dashboards.getParameterValue(selectionListName),
		                    totSelectCount = Dashboards.
		                            getParameterValue(selectedCountParamName),                                
		                    isSelectAllActive = Dashboards.
		                            getParameterValue(selectAllParamName),
		                    pos = list.indexOf(v);
		                    
		                if(pos===-1){
		                    list.push(v);
		                    totSelectCount = ( isSelectAllActive ? totSelectCount-=1 : totSelectCount+=1 );
		                }else{
		                    list.splice(pos,1);
		                    totSelectCount = ( isSelectAllActive ? totSelectCount+=1 : totSelectCount-=1 );
		                }
		                $(st.target).find("#"+this.id).toggleClass("selected");
		                selectTable.updateSelectAllOnPageStatus(tableComp,"selected",selectableColIdx);
						selectTable.updateSelectAllVisStatus(tableComp,selectionListName,selectAllParamName,totalCountParamName);
		                Dashboards.setParameter(selectedCountParamName,totSelectCount);
						selectTable.checkAndProcessFullDataSelection(selectionListName,selectAllParamName,selectedCountParamName,totalCountParamName);
		                Dashboards.fireChange(updateCountersEventName,$.now());		            
		            }
		        }               
		    ]
		}
		tableComp.setAddInOptions("colType","tableSelect",selectOpts);  
	};

	/* ******** Project Specific instantiations: END ****** */


	/* ******** Selectable Table Building blocks: START ****** */

	myself.clearSelection = function(selectionListName,selectAllParamName,selectedCountParamName,totalCountParamName){
    	Dashboards.setParameter(selectionListName,[]);
	    selectTable.resetSelectedCounts(selectAllParamName,selectedCountParamName,totalCountParamName);
	};
	myself.resetSelectedCounts = function(selectAllParamName,selectedCountParamName,totalCountParamName){
		var isSelectAllActive = Dashboards.getParameterValue(selectAllParamName),
			totalCount = Dashboards.getParameterValue(totalCountParamName);
	    Dashboards.setParameter(selectedCountParamName,(isSelectAllActive ? totalCount : 0));
	};
	myself.resetTotalsCount = function(totalCountParamName){
	    Dashboards.setParameter(totalCountParamName,0);
	};

	// Data Tables Interface Layer: START 

	myself.getColDataFromRowList = function(tableComp,colIdx,$rowList){

		// Get Array of original dataTable data on specified column,
		//		 for a list of jQuery Trs:
		var dataList =  _.map($rowList,function(ele,idx){
	            return selectTable.getColDataFromTr(tableComp,colIdx,ele);
        	});	
        return dataList;
	};

	myself.getColDataFromTr = function(tableComp,colIdx,tr){

		// Get original dataTable data on specified column
		//		 of specified DOM Tr on table:		
		var $table = $("#"+tableComp.htmlObject).find("table");
		var rowIdx = selectTable.getDataTableRowIdxFromTr(tableComp,tr);	
		return $table.dataTable().fnGetData(rowIdx)[colIdx];
	};

	myself.getDataTableRowIdxFromTr = function(tableComp,tr){

		// Get DataTable row index of specified DOM Tr on table:
		return $("#"+tableComp.htmlObject).find("table").dataTable().fnGetPosition(tr);
	};
	// Data Tables Interface Layer: END 


	myself.getRowsOnPage = function(tableComp){

		// Get list of jQuery Tr on table's visible page:
		var $table = $("#"+tableComp.htmlObject).find("table"),
    		$visTrList = $table.find("tbody").find("tr");
    	return $visTrList;
	};
	myself.getSelectedRowsFromRowsList = function(tableComp,$rowsList,selectedCssClass,selectableColIdx){

		// Get list of jQuery Trs which are selected on larger jQuery Tr list:
		var $activeBtns = $rowsList.find(".column"+selectableColIdx).find("."+selectedCssClass);
		return $activeBtns.parents("tr");
	};
	myself.getSelectedRowsOnPage = function(tableComp,selectedCssClass,selectableColIdx){

		// Get selected jQuery Tr list on table's visible page:
		var $rowsList = selectTable.getRowsOnPage(tableComp);
		return selectTable.
					getSelectedRowsFromRowsList(tableComp,$rowsList,selectedCssClass,selectableColIdx);
	};

	myself.checkIfPageSelectionIsFull = function(tableComp,selectedCssClass,selectableColIdx){
		return (selectTable.getRowsOnPage(tableComp).length === 
				selectTable.getSelectedRowsOnPage(tableComp,selectedCssClass,selectableColIdx).length);
	};

	myself.updateSelectAllOnPageStatus = function(tableComp,selectedCssClass,selectableColIdx){
		var $allOnPageBtnPh = $("#"+tableComp.htmlObject).find(".selectAllOnPageBtnCont"),
			isPageFullSelection = selectTable.
					checkIfPageSelectionIsFull(tableComp,selectedCssClass,selectableColIdx);

		if(isPageFullSelection){
			$allOnPageBtnPh.addClass("active")	
		}else{
			$allOnPageBtnPh.removeClass("active")	
		}
	};

	myself.updateSelectAllVisStatus = function(tableComp,selectionListName,selectAllParamName,totalCountParamName){
		var $allBtnPh = $("#"+tableComp.htmlObject).find(".selectAllBtnCont"),
			list = Dashboards.getParameterValue(selectionListName),
			selectAllStatus = Dashboards.getParameterValue(selectAllParamName),
			totalCount = Dashboards.getParameterValue(totalCountParamName);

		$allBtnPh.removeClass("empty");
		$allBtnPh.removeClass("full");
		$allBtnPh.removeClass("mixed");

		if( (list.length === 0 && !selectAllStatus) || (list.length === totalCount && selectAllStatus) ){
			$allBtnPh.addClass("empty")
		}else if( (list.length === 0 && selectAllStatus) || (list.length === totalCount && !selectAllStatus) ){
			$allBtnPh.addClass("full")
		}else{
			$allBtnPh.addClass("mixed")			
		}
	};

	myself.checkAndProcessFullDataSelection = function(selectionListName,selectAllParamName,selectedCountParamName,totalCountParamName){

		var selectionList = Dashboards.getParameterValue(selectionListName),
			totalCount = Dashboards.getParameterValue(totalCountParamName),
			originalSelectAlStatus = Dashboards.getParameterValue(selectAllParamName);

		//check if end of the road was reached:
		if(selectionList.length === totalCount){

			//toggle selectAll backstage status:
			Dashboards.setParameter(selectAllParamName,!originalSelectAlStatus);

			//clean selection:
			selectTable.clearSelection(selectionListName,selectAllParamName,selectedCountParamName,totalCountParamName);
		}
	};

	// Selection control panel on table: START

	myself.buildSelectionPanelOnTable = function(tableComp,selectAllParamName,selectionListName,
													updateCountersEventName,selectedCountParamName,
													totalCountParamName,selectableColIdx){

	    // build header selection control panels:
	    var $thead = $("#"+tableComp.htmlObject).find("thead"),
	        $originalTr = $thead.find("tr"),
	        $selectAllTr = $("<tr/>").addClass("customTr").addClass("selectAll").
	                appendTo($thead),
	        $selectAllOnPageTr = $("<tr/>").addClass("customTr").
	                addClass("selectAllOnPage").appendTo($thead),
	        $selectAllBtnPh = $("<div/>").addClass("selectAllBtnCont").
	        		toggleClass("active",Dashboards.getParameterValue(selectAllParamName)),
	        $selectAllOnPageBtnPh = $("<div/>").addClass("selectAllOnPageBtnCont");
	    
	    $.each($originalTr.find("th"),function(idx,th){
	        var $th = $(th),
	            cssClassAttr = $th.attr("class");
	        $selectAllTr.append( $("<td/>").attr("class",cssClassAttr).
	                removeClass("sorting") );
	        $selectAllOnPageTr.append( $("<td/>").attr("class",cssClassAttr).
	                removeClass("sorting") );
	    });

	    var $selectAllTds = $selectAllTr.find("td"),
	        $selectAllOnPageTds = $selectAllOnPageTr.find("td");
	    
	    $($selectAllTds[0]).append( $selectAllBtnPh.append($("<button/>")
	            .click(selectAllCallback)) );
	    $($selectAllTds[1]).append( $("<div/>").addClass("label").
	            text("select all") );
	    
	    $($selectAllOnPageTds[0]).append( $selectAllOnPageBtnPh.
	            append($("<button/>").click(selectAllOnPageCallback)) );
	    $($selectAllOnPageTds[1]).append( $("<div/>").addClass("label").
	            text("select all on this page") );

	    // Define selectAll and selectAllOnPage callbacks (sharing variables on scope):

		function selectAllCallback(){
		    var $ph = $(this).parent(),
		        isSelectAllActive = Dashboards.getParameterValue(selectAllParamName),
		        newSelectAllState = (isSelectAllActive ? false : true),
		        selectedCssClass = "selected";


		    Dashboards.setParameter(selectionListName,[]);
		    Dashboards.setParameter(selectAllParamName,newSelectAllState);
			selectTable.clearSelection(selectionListName,selectAllParamName,selectedCountParamName,totalCountParamName);

			Dashboards.fireChange(updateCountersEventName,$.now()); 

			if(newSelectAllState){
				selectTable.getRowsOnPage(tableComp).find("button").addClass(selectedCssClass);
			}else{
				selectTable.getRowsOnPage(tableComp).find("button").removeClass(selectedCssClass);
			}

			selectTable.updateSelectAllOnPageStatus(tableComp,selectedCssClass,selectableColIdx);

			// While adding empty, full and mixed css-classes, kept active class implementation 
			//		in case button toggle status knowledge becomes handy at DOM in a future situation:
		    $ph.toggleClass("active");

		    // New implementation of selectAll css class management:
			selectTable.updateSelectAllVisStatus(tableComp,selectionListName,selectAllParamName,totalCountParamName);
		};

		function selectAllOnPageCallback(){
		    var $ph = $(this).parent(),
		        isSelectAllOnPageActive = $ph.hasClass("active"),
		        // isSelectAllActive is telling if we're dealing with a negative selection
		        isSelectAllActive = Dashboards.getParameterValue(selectAllParamName),
		        $visRows = selectTable.getRowsOnPage(tableComp),
		        $selectedRows = selectTable.
		            getSelectedRowsFromRowsList(tableComp,$visRows,"selected",selectableColIdx),
		        allOnPageList = selectTable.
		            getColDataFromRowList(tableComp,selectableColIdx,$visRows),   
		        selectionList = Dashboards.getParameterValue(selectionListName),
		        updatedSelectionList = [],
		        selectionTotalDelta,
		        selectedTotalCount = Dashboards.getParameterValue(selectedCountParamName);

		    if(isSelectAllOnPageActive){
				updatedSelectionList = ( isSelectAllActive ?
						 _.union(selectionList,allOnPageList) :
						 _.difference(selectionList,allOnPageList) );

		        $visRows.find(".column"+selectableColIdx).find("button").removeClass("selected");
		        selectionTotalDelta = 0-$selectedRows.length;
		    }else{
				updatedSelectionList = ( isSelectAllActive ?
						 _.difference(selectionList,allOnPageList) :
						 _.union(selectionList,allOnPageList) );
		        $visRows.find(".column"+selectableColIdx).find("button").addClass("selected");
		        selectionTotalDelta = $visRows.length - $selectedRows.length;
		    }

		    Dashboards.setParameter(selectionListName,updatedSelectionList);	    
			Dashboards.setParameter(selectedCountParamName,selectedTotalCount+selectionTotalDelta);
			Dashboards.fireChange(updateCountersEventName,$.now());

		    $ph.toggleClass("active");
			selectTable.checkAndProcessFullDataSelection(selectionListName,selectAllParamName,selectedCountParamName,totalCountParamName);
		    // update check/update selectAll status:
		    selectTable.updateSelectAllVisStatus(tableComp,selectionListName,selectAllParamName,totalCountParamName);
		    
		};

	};

	// Selection control panel on table: END


	/* ******** Selectable Table Building blocks: END ****** */


})(selectTable);


/***************************************************************************
 *                            Add Ins                                      *
 ***************************************************************************/

;(function (){

  	var tableSelectDef = {
    	name: "tableSelect",
    	label: "Table Select",
    	defaults: {
      		getSelectedList: function(){
        		return [];
      		},
      		getSelectAllStatus: function(){
      			return false;
      		},
	      	buttons:[
	        	{
	          		id: "selectBtn",
	          		cssClass: "selectButton",
	          		selectedCssClass: "selected",
	          		title: "Select",
	          		action: function(v, st) {
	            		Dashboards.log(v);
	          		}
	        	}
	      	]
    	},

	    init: function(){
	        $.fn.dataTableExt.oSort[this.name+'-asc'] = $.fn.dataTableExt.oSort['string-asc'];
	        $.fn.dataTableExt.oSort[this.name+'-desc'] = $.fn.dataTableExt.oSort['string-desc'];
	    },
	    
	    implementation: function(tgt, st, opt){
	      	var $buttonContainer = $('<div/>').addClass('buttonContainer')
	        	.addClass('numButtons-' + opt.buttons.length);

	      	_.each(opt.buttons, function(el,idx){
	        	var $button = $("<button/>").attr("id",el.id).addClass(el.cssClass||"")
	        			.text(el.title||"");
	        	
	        	if(opt.getSelectAllStatus() === false){
		        	if (opt.getSelectList().indexOf(st.value) > -1) {
		          		$button.addClass(el.selectedCssClass);
		        	}
	        	} else {
		        	if (opt.getSelectList().indexOf(st.value) === -1) {
		          		$button.addClass(el.selectedCssClass);
		        	}	        		
	        	}
	        	$button.click(function(){
	          		if (el.action) {
	            		el.action(st.value, st);
	          		}
	        	});
	        	$buttonContainer.append($button);
	      	});
	      	$(tgt).empty().append($buttonContainer);

	    }

  	};
  	Dashboards.registerAddIn("Table", "colType", new AddIn(tableSelectDef));

})();