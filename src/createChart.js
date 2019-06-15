import ECharts from 'echarts';
import {ACCESS_TOKEN_KEY} from './constants';

class Chart {

  constructor() {
    this.node = null;
    this.contentNode = null;
    this.close = this.close.bind(this);
    this.onSetAccessToken = this.onSetAccessToken.bind(this);
  }

  onSetAccessToken() {
    const val = document.getElementById('access-token-input').value;
    if(val) {
      this.close();
      localStorage.setItem(ACCESS_TOKEN_KEY, val);
      alert('设置成功，点击Star trend按钮开始查询！');
    }
  }

  show() {

    // 容器节点
    this.node = document.createElement('div');
    this.node.style = 'display: flex; justify-content: center; align-items: center; z-index: 99999; position: absolute; left: 0; top: 0; right: 0; bottom: 0;';

    // 蒙层节点
    const maskNode = document.createElement('div');
    maskNode.style = 'display: flex; position: absolute; z-index: -1; left: 0; top: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,.3);';
    maskNode.addEventListener('click', this.close);

    // 内容节点
    this.contentNode = document.createElement('div');
    this.contentNode.innerHTML = loadingNode;

    // 插入dom中
    this.node.appendChild(maskNode);
    this.node.appendChild(this.contentNode);
    document.body.appendChild(this.node);
    document.documentElement.style.overflowY = 'hidden';
  }

  close() {
    document.documentElement.style.overflowY = 'scroll';
    document.body.removeChild(this.node);
    this.node = null;
    this.contentNode = null;
  }

  ready(data) {
    this.contentNode.innerHTML = chartNode;
    ECharts.init(document.getElementById('chart')).setOption({
      color: '#40A9FF',
      title: {text: 'STAR TREND'},
      xAxis:  {
        type: 'time',
        boundaryGap: false,
        splitLine: {show: false}
      },
      yAxis: {type: 'value'},
      tooltip: {trigger: 'axis'},
      series: [{
        data,
        type: 'line',
        smooth: true,
        symbol: 'none',
        name: 'star count'
      }]
    });
  }

  fail(err) {
    // 1是仓库url地址不对；2是Github API访问频次达到限制；3是未知错误
    if(err.errorCode === 2) {
      this.contentNode.innerHTML = accessTokenNode;
      document.getElementById('set-access-token-btn').addEventListener('click', this.onSetAccessToken);
    } else {
      this.contentNode.innerHTML = errorInfoNode(err.message);
    }
  }
}

// Loading加载中节点
const loadingNode = `
<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; width: 620px; height:420px; border-radius: 6px; background-color: #FFF;">
  <svg style="width: 100px; heihgt: 100px;" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" xml:space="preserve">
    <circle fill="none" stroke="#40A9FF" stroke-width="4" stroke-miterlimit="10" cx="50" cy="50" r="48"></circle>
    <line fill="none" stroke-linecap="round" stroke="#40A9FF" stroke-width="4" stroke-miterlimit="10" x1="50" y1="50" x2="85" y2="50.5" transform="rotate(71.4578 50 50)">
      <animateTransform attributeName="transform" dur="2s" type="rotate" from="0 50 50" to="360 50 50" repeatCount="indefinite"></animateTransform>
    </line>
    <line fill="none" stroke-linecap="round" stroke="#40A9FF" stroke-width="4" stroke-miterlimit="10" x1="50" y1="50" x2="49.5" y2="74" transform="rotate(321.528 50 50)">
      <animateTransform attributeName="transform" dur="15s" type="rotate" from="0 50 50" to="360 50 50" repeatCount="indefinite"></animateTransform>
    </line>
  </svg>
  <p style="margin-top: 20px; font-size: 18px; text-align: center; color: #40A9FF">LOADING...</p>
</div>
`;

// Chart图节点
const chartNode = `<div id="chart" style="width: 620px; height:420px; padding: 10px; border-radius: 6px; background-color: #FFF;"></div>`;

// Error节点
const errorInfoNode = (errorInfo) => `
<div style="max-width: 620px; padding: 15px; border-radius: 6px; background-color: #FFF;">
  <p style="font-size: 20px; color: #333; margin: 0;">${errorInfo}</p>
</div>
`;

// 设置Access Token节点
const accessTokenNode = `
<div style="max-width: 620px; padding: 15px; border-radius: 6px; background-color: #FFF;">
  <p style="font-size: 18px; color: #333; margin: 0;">当前已达<a href="https://developer.github.com/v3/#rate-limiting">Github API访问频次上限</a>，设置<a href="https://github.com/settings/tokens">AccessToken</a>可突破限制</p>
  <div style="display: flex; margin-top: 15px;">
    <input id="access-token-input" placeholder="Github Access Token" type="text" value="" style="display: flex; flex-grow: 1; height: 40px; margin: 0; padding: 6px 11px; font-size: 16px; border: 1px solid #d9d9d9; border-right-width: 0; border-radius: 4px; border-top-right-radius: 0; border-bottom-right-radius: 0;">
    <button id="set-access-token-btn" type="button" style="height: 40px; padding: 0 15px; font-size: 16px; border-radius: 4px; border-top-left-radius: 0; border-bottom-left-radius: 0; outline: 0; color: #fff; background-color: #1890ff;">保存</button>
  </div>
</div>
`;

export const createChart = () => new Chart();