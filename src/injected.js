import {createChart} from './createChart';
import {fetchHistoryData} from './fetchHistoryData';

let chart = null;
const trendSvg = `<svg style="width: 16px;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3108"><path d="M986.584615 602.584615a23.630769 23.630769 0 0 1-39.384615 15.753847L840.861538 512 596.676923 720.738462a66.953846 66.953846 0 0 1-96.492308 0l-147.692307-167.384616L90.584615 783.753846a21.661538 21.661538 0 0 1-33.476923 0l-11.815384-11.815384a21.661538 21.661538 0 0 1 0-31.507693l259.938461-352.492307a66.953846 66.953846 0 0 1 96.492308 0l147.692308 147.692307 149.661538-173.292307-96.492308-88.615385a25.6 25.6 0 0 1 15.753847-41.353846h322.953846a47.261538 47.261538 0 0 1 43.323077 49.230769z" p-id="3109"></path></svg>`;

/**
 * star趋势按钮点击事件
 */
function onClickStarTrend() {
  chart.show();
  fetchHistoryData(location.href).then(data => {
    chart.ready(data);
  }).catch(err => {
    chart.fail(err);
  });
}

/**
 * 创建star趋势按钮
 */
const createStarTrendBtn = () => {
  const starTrendBtn = document.createElement('button');
  starTrendBtn.setAttribute('class', 'btn btn-sm');
  starTrendBtn.innerHTML = `${trendSvg} Star Trend`;
  starTrendBtn.addEventListener('click', onClickStarTrend);
  return starTrendBtn;
};

/**
 * 注入star趋势按钮
 */
const injectStarTrendBtn = () => {
  var newNode = document.createElement('li');
  newNode.appendChild(createStarTrendBtn());
  var firstBtn = document.querySelector('.pagehead-actions > li');
  if(firstBtn && firstBtn.parentNode) {
    firstBtn.parentNode.insertBefore(newNode, firstBtn);
  }
};

(function run() {
  injectStarTrendBtn();
  chart = createChart();
}());