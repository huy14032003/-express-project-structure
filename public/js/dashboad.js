import ApexCharts from "../libs/apexcharts/dist/apexcharts.esm.js";
var options = {
  series: [
    {
      name: "Income",
      type: "column",
      data: [1.4, 2, 2.5, 1.5, 2.5, 2.8, 3.8, 4.6],
    },
    {
      name: "Cashflow",
      type: "column",
      data: [1.1, 3, 3.1, 4, 4.1, 4.9, 6.5, 8.5],
    },
    {
      name: "Revenue",
      type: "line",
      data: [20, 29, 37, 36, 44, 45, 50, 58],
    },
  ],
  chart: {
    height: 350,
    type: "line",
    stacked: false,
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: [1, 1, 4],
  },
  title: {
    text: "XYZ - Stock Analysis (2009 - 2016)",
    align: "left",
    offsetX: 110,
  },
  xaxis: {
    categories: [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016],
  },
  yaxis: [
    {
      seriesName: "Income",
      axisTicks: {
        show: true,
      },
      axisBorder: {
        show: true,
        color: "#008FFB",
      },
      labels: {
        style: {
          colors: "#008FFB",
        },
      },
      title: {
        text: "Income (thousand crores)",
        style: {
          color: "#008FFB",
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    {
      seriesName: "Cashflow",
      opposite: true,
      axisTicks: {
        show: true,
      },
      axisBorder: {
        show: true,
        color: "#00E396",
      },
      labels: {
        style: {
          colors: "#00E396",
        },
      },
      title: {
        text: "Operating Cashflow (thousand crores)",
        style: {
          color: "#00E396",
        },
      },
    },
    {
      seriesName: "Revenue",
      opposite: true,
      axisTicks: {
        show: true,
      },
      axisBorder: {
        show: true,
        color: "#FEB019",
      },
      labels: {
        style: {
          colors: "#FEB019",
        },
      },
      title: {
        text: "Revenue (thousand crores)",
        style: {
          color: "#FEB019",
        },
      },
    },
  ],
  tooltip: {
    fixed: {
      enabled: true,
      position: "topLeft", // topRight, topLeft, bottomRight, bottomLeft
      offsetY: 30,
      offsetX: 60,
    },
  },
  legend: {
    horizontalAlign: "left",
    offsetX: 40,
  },
};

var chart = new ApexCharts(document.querySelector("#chart"), options);
chart.render();
var colorPalette = ['#00D8B6','#008FFB',  '#FEB019', '#FF4560', '#775DD0']
var optionDonut = {
  chart: {
      type: 'donut',
      width: '100%',
      height: 400
  },
  dataLabels: {
    enabled: false,
  },
  plotOptions: {
    pie: {
      customScale: 0.8,
      donut: {
        size: '75%',
      },
      offsetY: 20,
    },
    stroke: {
      colors: undefined
    }
  },
  colors: colorPalette,
  title: {
    text: 'Department Sales',
    style: {
      fontSize: '18px'
    }
  },
  series: [21, 23, 19, 14, 6],
  labels: ['Clothing', 'Food Products', 'Electronics', 'Kitchen Utility', 'Gardening'],
  legend: {
    position: 'left',
    offsetY: 80
  }
}

var donut = new ApexCharts(
  document.querySelector("#chart1"),
  optionDonut
)
donut.render();
const ui = {
  get th() {
    return document.querySelector("th");
  },
};
function renderThead() {
  const thead = document.querySelector("thead");
  const a = [];
  for (let i = 0; i < 6; i++) {
    a.push("name" + [i]);
  }
  a.forEach((item) => {
    const th = document.createElement("th");
    th.innerHTML = `
    ${item}
    `;
    thead.appendChild(th);
  });
}
renderThead();
function renderTbody() {
  const tbody = document.querySelector("tbody");
  for (let i = 0; i < 20; i++) {
    const tr = document.createElement("tr");
    for (let j = 0; j < 6; j++) {
      const td = document.createElement("td");
      td.textContent = Math.random();
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
}



renderTbody();
