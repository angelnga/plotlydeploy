function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();


function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}


// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    var samplesArray = data.samples;
    allSamples=[]
      for (let x = 0; x<samplesArray.length;x++) {
        allSamples.push({
          otu_ids: samplesArray[x].otu_ids,
          otu_labels: samplesArray[x].otu_labels,
          sample_values: samplesArray[x].sample_values
        })
      };
    // 4. Create a variable that filters the samples for the object with the desired sample number.
    var samplePick = samplesArray.filter(sampleObj => sampleObj.id == sample)
    //  5. Create a variable that holds the first sample in the array.
    var firstSample = samplePick[0]
    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    var  otu_ids = firstSample.otu_ids
    var  otu_labels = firstSample.otu_labels
    var  sample_values = firstSample.sample_values
    // 8. Create the trace for the bar chart. 
    topTen=[]
    for (let x = 0; x<firstSample.sample_values.length;x++) {
      topTen.push({
        otu_ids: 'OTU ' + firstSample.otu_ids[x].toString(),
        otu_labels: firstSample.otu_labels[x],
        sample_values: firstSample.sample_values[x]
      })
    };
    topTen = topTen.sort((a,b)=>b.sample_values-a.sample_values).slice(0,10)
      //get the topTen for bar
    var bar_otu_ids = []
    var bar_otu_labels = []
    var bar_sample_values = []
    for (samp of topTen){
      bar_otu_ids.push(samp.otu_ids)
      bar_otu_labels.push(samp.otu_labels)
      bar_sample_values.push(samp.sample_values)
    }
      //compute averages per occurrence of each OTU ID
    var otuTotal = {}
    var otuCount = {}
    for (let x=0;x<allSamples.length;x++) {
      for (let y=0;y<allSamples[x].otu_ids.length;y++){
        if (allSamples[x].otu_ids[y] in otuTotal){
          otuTotal[allSamples[x].otu_ids[y]]+=allSamples[x].sample_values[y]
          otuCount[allSamples[x].otu_ids[y]]+=1
        }
        else {
          otuTotal[allSamples[x].otu_ids[y]]=allSamples[x].sample_values[y]
          otuCount[allSamples[x].otu_ids[y]]=1
        }}
    }
    var otuAvg = {}
    for (let x=0;x<Object.values(otuTotal).length;x++){
      otuAvg['OTU '+Object.keys(otuTotal)[x]] = Object.values(otuTotal)[x]/Object.values(otuCount)[x]
    }
      //save avg values for OTU ID in the bar chart
    var barAvg=[]
    for (x of bar_otu_ids) {
      barAvg.push(otuAvg[x])
    }
      //trace for bar
    var barData = {
      name:"ID: "+sample.toString(),
      x: bar_sample_values,
      y: bar_otu_ids,
      text: bar_otu_labels,
      type: "bar", 
      orientation: 'h'
    };
    var barDataAvg = {
      name: "Avg",
      x: barAvg,
      y: bar_otu_ids,
      mode: "markers",
      marker: {color:"black",size:7}
    }
    barData = [barData,barDataAvg];
    // 9. Create the layout for the bar chart. 
    var barLayout = {
      title: { text: "<span style='font-weight:bold;font-size:90%'>Top 10 Bacteria Cultures Found</span><br><span style='font-size:0.65em'>(Black dots represent mean sample values per OTU ID)</span>" },
      yaxis: {autorange: "reversed"},
      autosize: true,
      plot_bgcolor: '#c7c7c7',
      hoverlabel: {font:{size:8}},
      showlegend:false,
      hovermode: 'closest'
    };

    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar", barData, barLayout)
  });
}

