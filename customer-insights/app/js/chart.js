var cusInsightsChartObj = {};
var customerInsightsList = [];
function getTwoDigitsValue(value) {
  if (value !== 0 && value < 10) {
    value = '0' + value;
  }
  return value;
}

function renderChart(
  totalCount,
  openCount,
  overDueCount,
  onHoldCount,
  isOnHoldEnabled,
  closedTickets
) {
  var chartData = getChartData(
    totalCount,
    openCount,
    overDueCount,
    onHoldCount,
    isOnHoldEnabled,
    closedTickets
  );
  cusInsightsChartObj = drawZCharts(document.getElementById('chartContainer'), chartData);
  customerInsightsList = isOnHoldEnabled ? [true, true, true] : [true, true];
}

function getChartData(ticketsObj) {
  var colors = ['#cfcfcf'],
    isTooltip = false,
    chartData = ticketsObj.isOnHoldEnabled
      ? [['Open', 5], ['Closed', 5], ['OnHold', 5]]
      : [['Open', 5][('Closed', 5)]];
  if (ticketsObj.totalCount) {
    isTooltip = true;
    if (ticketsObj.isOnHoldEnabled) {
      colors = ['#00a3fe', '#3bc46a', '#f9a64d'];
      chartData = [['Open', ticketsObj.openCount], ['Closed', ticketsObj.closedTickets], ['OnHold', ticketsObj.onHoldCount]];
    } else {
      colors = ['#00a3fe', '#3bc46a'];
      chartData = [['Open', ticketsObj.openCount], ['Closed', ticketsObj.closedTickets]];
    }
  }

  var chartData = {
    chart: {
      marginLeft: 0,
      plot: {
        plotoptions: {
          pie: {
            innerRadius: '78%',
            strokeColor: '#FFFFFF',
            strokeWidth: 2,
            outerPadding: 0,
            sliceOutHeight: 1
          }
        }
      }
    },
    metadata: {
      axes: {
        x: [0],
        y: [[1]],
        tooltip: [
          "<span style='font-size:12px;'>{{val(0)}} - {{val(1)}} &#40;{{per(1)}}&#41;</span>"
        ]
      },
      columns: [
        {
          dataindex: 0,
          columnname: '',
          datatype: 'ordinal'
        },
        {
          dataindex: 1,
          columnname: '',
          datatype: 'numeric'
        }
      ]
    },
    seriesdata: {
      chartdata: [
        {
          type: 'pie',
          data: [chartData]
        }
      ]
    },
    canvas: {
      subtitle: {
        show: false
      },
      title: {
        hAlign: 'center',
        text: 'Donut with radial gradient',
        show: false
      },
      border: {
        show: false
      },
      shadow: {
        show: false
      },
      fontFamily: 'ProximaNovaRegular',
      intelligence: {
        dimension: {
          xaxis: 0,
          xaxislabel: 0,
          yaxis: 0,
          yaxislabel: 0,
          legend: 0,
          marker: 0
        }
      }
    },
    legend: {
      colors: colors,
      enabled: false
    },
    tooltip: {
      enabled: isTooltip,
      backgroundColor: '#FFFFFF',
      fontColor: '#333333',
      shadow: '2px 2px 2px rgba(0,0,0,0.3)',
      borderRadius: 1,
      opacity: 1,
      borderWidth: 2
    }
  };
  return chartData;
}

function drawZCharts(chartContainer, chartData) {
  var zrd3charts = new $ZC.charts(chartContainer, chartData);
  return zrd3charts;
}

function filterSeriesUpdate(chartObj, index) {
  var dataObj =
    chartObj.isAxisCategory ||
      chartObj.isNonAxisMultiSeriesCategory ||
      chartObj.dataObject.isPolarAxisCategory
      ? chartObj.seriesdata[index]
      : chartObj.seriesdata[0].data[0][index];
  chartObj.legend.component.filterSeriesNUpdate(dataObj, index, chartObj);
}

function toggleLegend(index) {
  var list = ['cntActOpn', 'cntActClosed', 'cntActOnHld'];
  var countList = ['open_count', 'closed_count', 'onhold_count'];
  var totalContainer = document.getElementById('total_Count');
  var totalCount = parseInt(totalContainer.innerText);
  var toggleCount = parseInt(document.getElementById(countList[index]).innerText);
  var legendLen = cusInsightsChartObj.seriesdata[0].data[0].filter(function (d) {
    return !d.disabled;
  }).length;

  // Legend disable handling - Atleast one legend should be enabled and count should not be 0
  if (
    (legendLen > 1 || !customerInsightsList[index]) &&
    (!customerInsightsList[index] || totalCount !== toggleCount)
  ) {
    var container = document.getElementById('cntActDot' + index).classList;
    var containerLabel = document.getElementById('cntActLabel' + index).classList;
    if (customerInsightsList[index]) {
      customerInsightsList[index] = false;
      container.add('cntActGrey');
      container.remove(list[index]);
      containerLabel.add('cntActGrey');
      totalContainer.innerText = getTwoDigitsValue(totalCount - toggleCount);
    } else {
      customerInsightsList[index] = true;
      container.add(list[index]);
      container.remove('cntActGrey');
      containerLabel.remove('cntActGrey');
      totalContainer.innerText = getTwoDigitsValue(totalCount + toggleCount);
    }
    filterSeriesUpdate(cusInsightsChartObj, index);
  }
}
