
//bug fix to redraw resizing text
function resizeAfterContentISGenerated(department){
    //$('#directoryContainer').css('top', '-0.9vh');
    var departmentClassName = department.split(' ').join('-');
    shrinkTextToFitSection(departmentClassName);

    var causeRepaintsOn = $("span, div");
    $(window).resize(function() {
        causeRepaintsOn.css("z-index", 1);
});

//shrink data rows to fit in the container if there is overflow


}

//pull directory data from endpoint
var directoryData;
pullDirectoryInfo();

function pullDirectoryInfo() {

    var url;

    if(window.location.hostname.includes('localhost')){
        url = window.location.href + 'data';
    } else {
        url = 'https://e90-walkindisplay.azurewebsites.net/data';
    }

    console.log(url);
       

    $.ajax({
        url: url,
        type: "GET",
        dataType: "JSON",
        beforeSend: function(xhr) { xhr.setRequestHeader("accept", "application/json;odata=verbose"); },
        success: function(results) {
            data = JSON.parse(results);
            directoryData = data.value;
            console.log(data);
            build();
        },
        error: function(xhr, error) {
            console.log("error pulling data from list");
            console.log(xhr);
            console.log(error);
        }
    });
}


function build(){
    var departmentNames = getDepartmentNames();
    for(var i = 0; i < departmentNames.length; i++){
        generateHtml(departmentNames[i]);
    }
    for(var j = 0; j < departmentNames.length; j++){
        resizeAfterContentISGenerated(departmentNames[j]);
    }
}

function getDepartmentNames(){
    var uniqueDepartmentNames = [];
    for(var i = 0; i < directoryData.length; i++){
        if(uniqueDepartmentNames.indexOf(directoryData[i].Department) <= -1){
            uniqueDepartmentNames.push(directoryData[i].Department);
        }
    }
    return uniqueDepartmentNames;
}

function generateHtml(department) {
   var dept = filterDepartment(department);
   var deptName = department.split(' ').join('-');
   var html = '';

   if(dept.length > 0){
    for(var i = 0; i < dept.length; i++){
        html += '<div class="'+deptName+' dataRow">';
        html += '<span class="lastName dataPoint">'+ (dept[i].NameLast || '') +'</span>';
        html += '<span class="firstName dataPoint">'+ (dept[i].NameFirst || '') +'</span>';
        html += '<span class="phone dataPoint">'+ (dept[i].Campus_PhoneNumber || '') +'</span>';
   // Removed Location per Jason's request 9/12     html += '<span class="office dataPoint">'+ (dept[i].Campus_Formatted || '') +'</span>';
        html += '</div>';
    }
   }
   else {
       html = '<div class="error"><span>Unable to pull directory information for '+department+'</span></div>';
   }
   $('#'+deptName).append(html);
}

function filterDepartment(department){
    console.log('filter department:' + department);
    var filteredDept = [];
    var filteredArry = [];
    
    filteredArry = Object.getOwnPropertyNames(directoryData).filter(function(item) {
        return directoryData[item].Department === department;
    });
    //console.log('filter department:',filteredArry);
        if(filteredArry.length >0){
            for(var i = 0; i < filteredArry.length; i++){

                filteredDept.push(directoryData[filteredArry[i]]);
            }
    } else {
        console.log('error: unable to retrieve filtered results for the ' + department + ' department!'  );
    }
    //console.log('filter department results: ', filteredDept); //for troubleshooting
    filteredDept = alphaSortArray(filteredDept);
    return filteredDept;
}

function alphaSortArray(arrayName) {
    arrayName.sort(function(a, b){
        var lastNameA=a.NameLast.toLowerCase(), LastNameB=b.NameLast.toLowerCase();
        if (lastNameA < LastNameB) //sort string ascending
            return -1; 
        if (lastNameA > LastNameB)
            return 1;
        return 0; //default return value (no sorting)
    });

    return arrayName;
}


function shrinkTextToFitSection(sectionName) {
    //do not shrink ExecEd as they will have multiple columns
    if(sectionName === 'Executive-Education'){
        return;
    } else {
        var dataRowsToSearch = $('div.dataRow.'+ sectionName);
        //Default value
        dataRowsToSearch.css('height', '1.5vh');

        calculateSectionHeights(sectionName,dataRowsToSearch);
    }
}

function calculateSectionHeights(sectionName,dataRowsToSearch) {
    //Set variables to be used later for comparison
    var dataRowHeight = 0;
    var sectionHeight = 0;
    
    //get sum of individual elements
    dataRowsToSearch.each(function(key, elem) {
        //key = index , element = elemenet for that index returned
        dataRowHeight += $(elem).outerHeight();
    });
    
    //get height of container
    sectionHeight = $('div.dataContainer#' + sectionName).height();

     //check: if elements had 0 height throw error and exit function
     if (dataRowHeight < 1 || sectionHeight < 1) {
        console.log('error: could not fetch height for : ' + sectionName);
        return; 
    } else {
    shrinkDataRowsInSection(sectionName,dataRowsToSearch,dataRowHeight,sectionHeight);
    }
}

function shrinkDataRowsInSection(sectionName,dataRowsToSearch,dataRowHeight,sectionHeight) {
    //If valid height returns shrink text row till it fits in container
    //convert to vh
    //in PX
    var heightInPX = parseFloat(dataRowsToSearch.css('height'));
    //in VH
    var heightInVH = heightInPX / document.documentElement.clientHeight *100;
    console.log('converted vh is: ',heightInVH);
    //increment to small sizes by 0.05vh
    var newHeightInVH = (heightInVH - 0.05) + 'vh';

    //TODO rather than running this multiple times till the elements fit we should do a calculation once then adjust the elements accordingly
    if( dataRowHeight > sectionHeight ) {
        dataRowsToSearch.css('height', newHeightInVH);
        console.log(dataRowsToSearch.css('height'));
        //reset the loop, can check to see if the data rows need to be shrink again
        calculateSectionHeights(sectionName,dataRowsToSearch);
    }
}
