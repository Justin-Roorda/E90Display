//bug fix to redraw resizing text
function resizeAfterContentISGenerated(){
    $('#directoryContainer').css('top', '-0.9vh');
    var causeRepaintOn = $("span, div");
$(window).resize(function() {
    causeRepaintsOn.css("z-index", 1);
    
});
}

//pull directory data from endpoint
var directoryData;
pullDirectoryInfo();

function pullDirectoryInfo() {
    var url = 'https://localhost:1337/data';
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
        html += '<span class="office dataPoint">'+ (dept[i].Campus_Formatted || '') +'</span>';
        html += '</div>';
    }
   }
   else {
       html = '<div class="error"><span>Unable to pull directory information for '+department+'</span></div>';
   }
   $('#'+deptName).append(html);
   resizeAfterContentISGenerated();
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
    console.log('filter department results: ', filteredDept);
    return filteredDept;
}