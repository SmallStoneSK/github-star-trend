import axios from 'axios';
import {URL_NUM, ACCESS_TOKEN_KEY} from './constants';

const makeRepoRequestUrl = repo => {
  return `https://api.github.com/repos/${repo}`;
}

const makeStarRequestUrl = (repo, page) => {
  let url = `https://api.github.com/repos/${repo}/stargazers`;
  if(page) {
    url += `?page=${page}`;
  }
  return url;
}

export const fetchHistoryData = (repoUrl) => {

  // 从当前地址栏url中提取出有效的仓库信息
  const repoRegRet = repoUrl.match(/https?:\/\/github.com\/([^/]+\/[^/]+)\/?.*/);
  
  // 无效地址
  if(!repoRegRet) {
    return new Promise((res, rej) => rej({
      errorCode: 1,
      message: `当前地址${repoUrl}不合法，未包含有效的仓库信息`
    }));
  }

  // 请求参数
  let accessToken = '';
  const requestConfig = {headers: {Accept: 'application/vnd.github.v3.star+json'}};
  if(accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)) {
    requestConfig.params = {access_token: accessToken};
  }
  
  const firstUrl = makeStarRequestUrl(repoRegRet[1]);
  return axios.get(firstUrl, requestConfig).then(firstResponse => {

    // 1. 发起第一次请求，从response headers的Link字段中解析出该仓库的star一共有多少页(totalPage)
    // link example: <https://api.github.com/repositories/4580780/stargazers?page=2>; rel="next", <https://api.github.com/repositories/4580780/stargazers?page=8>; rel="last"
    let totalPage = 1;
    const linkVal = firstResponse.headers.link;
    if(linkVal) {
      const pageRegRet = linkVal.match(/next.*?page=(\d+).*?last/);
      if(pageRegRet) {
        totalPage = Math.min(pageRegRet[1], 1333);
      }
    }

    // 2. 然后根据totalPage，拼接出需要获取star数据的urls
    const urls = new Array(totalPage - 1).fill(1).slice(0, URL_NUM - 1).map((_, idx) => {
      let page = idx + 2;
      if(totalPage > URL_NUM) {
        page = Math.round(page / URL_NUM * totalPage);
      }
      return {page, url: makeStarRequestUrl(repoRegRet[1], page)};
    });
    return {
      totalPage,
      requests: [
        {page: 1, request: Promise.resolve(firstResponse)},
        ...urls.map(item => ({page: item.page, request: axios.get(item.url, requestConfig)}))
      ]
    };
  }).then(({totalPage, requests}) => {

    // 3. 接着发起所有的urls请求，拿到所有的返回数据后，构造图表数据
    return Promise.all(requests.map(_ => _.request)).then(responses => {
      const data = [];
      if(totalPage <= URL_NUM) {
        responses.forEach(response => {
          response.data.map(item => {
            data.push({value: [new Date(item.starred_at), data.length + 1]});
          });
        });
        return data;
      } else {

        // 4. 当star数量过多时，github不会返回所有的page，此时需要单独查一次仓库信息，获取该仓库的总star数
        responses.forEach((response, index) => {
          const starredAtDate = new Date(response.data[0].starred_at);
          const starCount = 30 * (requests[index].page - 1);
          data.push({value: [starredAtDate, starCount]});
        });
        return axios.get(makeRepoRequestUrl(repoRegRet[1]), requestConfig).then(response => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          data.push({value: [today, response.data.stargazers_count]});
          return data;
        });
      }
    });
  }).catch(err => {
    if(err && err.response && err.response.status === 403) {
      throw {
        errorCode: 2,
        message: '当前已达到Github API访问频次上限，可以通过设置AccessToken来突破限制'
      };
    } else {
      throw {...err, errorCode: 3};
    }
  });
};