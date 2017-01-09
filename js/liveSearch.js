var possibleResults = [];
var sortType = 2;

$(document).ready(function () {

	$.get("./json/webCrawlerResults.json", jsonDoc, "json");

	$('#search').click(function () {
		search(sortType);
	});

	$('#filter').keydown(function (event) {
		if (event.keyCode == 13)
			search(sortType);
	});

	$('.sortType').click(function () {
		sortType = $(this).val();
		$(".btn-success").toggleClass("btn-success").toggleClass("btn-primary");
		$(this).toggleClass("btn-primary").toggleClass("btn-success");
		search(sortType);
	});	
});

function jsonDoc(data) {
	var i = "";
	$.each(data.results, function (k, v) {
		if (v.c == "db") {
			imgSrc = v.i;
			imgAlt = "Data Blog";
			tag = "Data Blog"
		} else if (v.c == "dc") {
			imgSrc = "../datalab/img/increase2.png";
			imgAlt = "Data Cube";
			tag = "Data Cube"
		} else if (v.c == "cdiif") {
			imgSrc = "../datalab/img/clipboard.png";
			imgAlt = "Chronic Disease and Injury Indicator Framework";
			tag = "CDIIF"
		} else if (v.c == "pmh") {
			imgSrc = "../datalab/img/brain2.png";
			imgAlt = "Positive Mental Health Surveillance Indicator Framework";
			tag = "PMHSIF"
		}
		var desc = v.d;
		if (desc.length > 330)
			desc = desc.substring(0, 330) + '...';
		var result = '<section><figure class="thumbnail"><a href="' + v.l + '"><img width=100 height=100 src="' + imgSrc + '"alt="' + imgAlt + '"></a><figcaption class="caption"><h4>' + v.h + '</h4><p><small><strong>Tags:</strong></small> <a href="#" class="resultTag">' + tag + '</a></p><p class="descText">' + desc + '</p><p><a href="' + v.l + '" class="btn btn-primary">View</a></p></figcaption></figure></section>'
		possibleResults.push(result);
	});

	if ($('#filter').val() !== '') {
		search(sortType);
	}
}

function search(sortType) {
	var searchResults = [];
	var maxSearchScore = 0;

	//console.log("Possible Results Length: "+possibleResults.length);

	// Retrieve the input field text and reset the count to zero
	var filter = $('#filter').val(), count = 0;
	filter = filter.replace(/data\s*blog/ig, 'blog'); //if 'data blog' is entered, ignore 'data'
	filter = filter.replace(/data\s*cube/ig, 'cube'); //if 'data cube' is entered, ignore 'data'
	
	if (filter.match(/Positive\s*Mental\s*Health\s*Surveillance\s*Indicator\s*Framework\s*/, "gi") == null){
		filter = filter.replace(/(Chronic\s*Disease*\s*and\s*Injury\s*)?Indicator\s*Framework/ig, ' CDIIF ');		
	}	
	filter = filter.replace(/Positive\s*Mental\s*Health\s*Surveillance\s*Indicator\s*Framework\s*/ig, ' PMHSIF ');
	
	var filterArr = filter.split(' ');

	//console.log("Filter Arr Length: "+filterArr.length);

	// Loop through the comment list
	$.each(possibleResults, function (ind, res) {
		var found = false;
		var searchScore = 0;
		var order = 0;
		var test = 0;

		for (var i = 0; i < filterArr.length; i++) {
			if (filterArr[i].length > 2) {
				var resHeader = $(res).find('h4').first().text();
				var resDesc = $(res).find('.descText').first().text();
				var type = $(res).find('.resultTag').first().text();
				var az = resHeader.substring(0, 5);

				searchScore += (resHeader.match(new RegExp(filterArr[i], "gi")) || []).length;
				searchScore += (resDesc.match(new RegExp(filterArr[i], "gi")) || []).length;
				searchScore += (type.match(new RegExp(filterArr[i], "gi")) || []).length;

				if (searchScore > 0) {
					found = true;
				}

				if (searchScore > maxSearchScore) {
					maxSearchScore = searchScore;
				}
			}
		}

		if (found) {
			var innerArr = [];
			innerArr.push(searchScore);
			innerArr.push(res);
			innerArr.push(type);
			innerArr.push(order);
			innerArr.push(az);
			searchResults.push(innerArr);
			count++;
		}
	});

	var maxType = "";
	
	for (var i = 0; i < searchResults.length; i++) {
		if (searchResults[i][0] == maxSearchScore) {
			maxType = searchResults[i][2];
			for (var i = 0; i < searchResults.length; i++) {
				if (maxType == "Data Blog") {
					if (searchResults[i][2] == "Data Blog") {
						searchResults[i][3] = 1;
					} else if ((searchResults[i][2] == "CDIIF") || (searchResults[i][2] == "PMHSIF")) {
						searchResults[i][3] = 2;
					} else {
						searchResults[i][3] = 3;
					}
				} else if ((maxType == "CDIIF") || (maxType == "PMH")) {
					if ((searchResults[i][2] == "CDIIF") || (searchResults[i][2] == "PMHSIF")) {
						searchResults[i][3] = 1;
					} else if (searchResults[i][2] == "Data Blog") {
						searchResults[i][3] = 2;
					} else {
						searchResults[i][3] = 3;
					}
				} else {
					if (searchResults[i][2] == "Data Cube") {
						searchResults[i][3] = 1;
					} else if ((searchResults[i][2] == "CDIIF") || (searchResults[i][2] == "PMHSIF")) {
						searchResults[i][3] = 2;
					} else {
						searchResults[i][3] = 3;
					}
				}
			}
		}
	}

	var text = "";
	$('#searchResult').html("");

	sort(searchResults, sortType);

	var colCount = 1;
	var sectionCount = 0;
	var previousCategory = "";

	text = "<h2>Search Results</h2><p><span id='filter-count'></span></p>";


	for (var i = 0; i < searchResults.length; i++) {
		var nextCategory = $(searchResults[i][1]).find('.resultTag').first().text();
		if (colCount == 4)
			colCount = 1;
		if (sortType == 2) {
			if (nextCategory !== previousCategory) {
				if (colCount != 1)
					text += "</div>";
				text += "<h3>" + nextCategory + "</h3><hr/>";
				previousCategory = nextCategory;
				colCount = 1;
			}
		}
		if (colCount == 1)
			text += $('#searchResult').html() + "<div class='row'>";
		text += $('#searchResult').html() + "<div class='col-md-4'>" + $(searchResults[i][1]).html() + "</div>";
		if (i == searchResults.length - 1 || colCount == 3)
			text += $('#searchResult').html() + "</div>";
		colCount++;
	}

	$('#searchResult').html(text);
	if ($('#filter').val() !== "" && $('#filter').val().length > 1 && searchResults.length > 0) {
		$('#index').hide('slow');
		$('#searchResult').fadeIn('slow');
	}
	else {
		$('#index').fadeIn();
		$('#searchResult').hide();
	}

	// Update the result count
	if (count > 0 && $('#filter').val() !== "")
		$("#filter-count").text("Results returned (" + count + ")");
	else if ($('#filter').val() === "")
		$("#filter-count").html('');
	else
		$("#filter-count").html("<span style='color:red'><strong>Nothing found!</strong></span>");
}

function sort(searchResults, sortType) {
	//Default sort behaviour

//	console.log("The sort type is " + sortType);

	searchResults.sort(function (a, b) {

		var q1 = a[3];
		var q2 = b[3];

		var o1 = b[2];
		var o2 = a[2];

		var p1 = b[0];
		var p2 = a[0];

		var az1 = a[4];
		var az2 = b[4];

		if (sortType == 3) {
			if (p1 < p2) return -1;
			if (p1 > p2) return 1;

			if (o1 < o2) return -1;
			if (o1 > o2) return 1;
		}
		else if (sortType == 2) {
			if (q1 < q2) return -1;
			if (q1 > q2) return 1;

			if (o1 < o2) return -1;
			if (o1 > o2) return 1;

			if (p1 < p2) return -1;
			if (p1 > p2) return 1;
		}
		else {
			if (az1 < az2) return -1;
			if (az1 > az2) return 1;
		}

		return 0;
	});
}