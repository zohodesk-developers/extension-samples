window.onload = function () {
  ZOHODESK.extension.onload().then(function (App) {
    const ORG_ID = ZOHODESK.get('portal.id').then(function (response) {
      return response['portal.id'];
    });

    var DEPARTMENT_ID = ZOHODESK.get('department.id').then(function (response) {
      return response['department.id'];
    });

    var CONTACT_ID = ZOHODESK.get('ticket.contactId').then(function (response) {
      return response['ticket.contactId']
    })

    const CONNECTION_LINK_NAME = '<Connection Link Name>';

    const getContactFullName = function (firstName = '', lastName = '') {
      var initial = '';
      if (firstName) {
        initial = firstName[0];
      }
      if (lastName) {
        initial += initial ? lastName[0] : lastName.substring(0, 2);
      }
      return initial ? initial.toUpperCase() : initial;
    };

    const convertMilliToHrsMins = function (millisec) {
      if (millisec < 1000) {
        return { hours: 0, minutes: 0 };
      }
      var hours = parseInt(millisec / 1000 / 60 / 60) || 0;
      var minutes = parseInt((millisec / 1000 / 60) % 60) || 0;
      return { hours: hours, minutes: minutes };
    };

    const getMaxRange = function (maxRange) {
      return maxRange < 10
        ? 10
        : maxRange < 25
          ? 25
          : maxRange < 50
            ? 50
            : maxRange < 100
              ? 100
              : maxRange + (100 - (maxRange % 100));
    };


    Promise.all([ORG_ID, DEPARTMENT_ID, CONTACT_ID]).then(function (response) {
      var orgId = response[0], departmentId = response[1], contactId = response[2]
      getContactDetails(orgId, contactId, function (response) {
        document.getElementById('loading').classList.add('hide');
        document.getElementById('custContainer').classList.remove('hide');
        renderContactDetails(response, orgId);
        getContactStatistics(orgId, departmentId, contactId);
      });
    }).catch(function (err) {
      renderErrorMessage(err.errMsg)
    });

    const getContactDetails = function (orgId, contactId, callback) {
      var reqObj = {
        url: `https://desk.zoho.com/api/v1/contacts/${contactId}`,
        headers: {
          'Content-Type': 'application/json',
          orgId: orgId
        },
        type: 'GET',
        data: { include: 'accounts' },
        postBody: {},
        connectionLinkName: CONNECTION_LINK_NAME
      };
      ZOHODESK.request(reqObj)
        .then(function (response) {
          var response = JSON.parse(JSON.parse(response).response);
          if (response.status === 'true') {
            callback && callback(response.statusMessage);
          } else {
            renderErrorMessage(response.statusMessage);
          }
        })
        .catch(function (err) {
          var errorObj = JSON.parse(JSON.parse(err).statusMessage);
          renderErrorMessage(errorObj.message);
        });
    };

    const getContactStatistics = function (orgId, departmentId, contactId) {
      departmentId = departmentId == '0' ? 'allDepartment' : departmentId;
      var reqObj = {
        url: `https://desk.zoho.com/api/v1/contacts/${contactId}/statistics`,
        headers: {
          'Content-Type': 'application/json',
          orgId: orgId
        },
        type: 'GET',
        data: { department: departmentId },
        postBody: {},
        connectionLinkName: CONNECTION_LINK_NAME
      };
      ZOHODESK.request(reqObj)
        .then(function (response) {
          var response = JSON.parse(JSON.parse(response).response);
          if (response.status === 'true') {
            renderProgress(response.statusMessage);
          } else {
            renderErrorMessage(response.statusMessage);
          }
        })
        .catch(function (err) {
          var errorObj = JSON.parse(JSON.parse(err).statusMessage);
          renderErrorMessage(errorObj.message);
        });
    };

    const renderErrorMessage = function (message) {
      document.getElementById('loading').classList.add('hide');
      document.getElementById('errorContainer').classList.remove('hide');
      document.getElementById('errorMsg').innerText = `OOPS! ${message}`;
    };

    const renderContactDetails = function (data, orgId) {
      var firstName = data.firstName;
      var lastName = data.lastName;
      var photoURL = data.photoURL;
      var contactName = firstName ? `${firstName} ${lastName}` : lastName;
      var accountName = data.account ? data.account.accountName : null;
      var initalContainer = document.getElementById('initalId');
      var contactContainer = document.getElementById('contactName');

      contactContainer.innerHTML = contactName;
      contactContainer.setAttribute('title', contactName);
      initalContainer.innerText = getContactFullName(firstName, lastName);

      if (photoURL) {
        var photoContainer = document.getElementById('photo_url');
        document.getElementById('initalId').classList.add('hide');
        photoContainer.src = `${photoURL}?orgId=${orgId}`;
        photoContainer.classList.remove('hide');
      } else {
        document.getElementById('photo_url').classList.add('hide');
        initalContainer.classList.remove('hide');
      }
      if (accountName) {
        var accountContainer = document.getElementById('accountName');
        accountContainer.innerHTML = accountName;
        accountContainer.setAttribute('title', accountName);
      }
    };

    const renderProgress = function (response) {
      var ticketsObj = {};
      ticketsObj.totalTickets = parseInt(response.totalTickets) || 0;
      ticketsObj.openTickets = parseInt(response.openTickets) || 0;
      ticketsObj.overdueTickets = parseInt(response.overdueTickets) || 0;
      ticketsObj.isOnHoldEnabled = response.hasOwnProperty('onholdTickets');
      ticketsObj.onHoldTickets = parseInt(response.onholdTickets) || 0;
      ticketsObj.closedTickets = ticketsObj.totalTickets ? ticketsObj.totalTickets - (ticketsObj.openTickets + ticketsObj.onHoldTickets) : 0;
      if (ticketsObj.isOnHoldEnabled) {
        document.getElementById('cntActDot2').classList.remove('hide');
        document.getElementById('cntActLabel2').classList.remove('hide');
      }
      renderChart(ticketsObj);
      renderCount('total_Count', ticketsObj.totalTickets);
      ticketsObj.totalTickets && renderTicketColor();
      renderCount('open_count', ticketsObj.openTickets);
      renderCount('onhold_count', ticketsObj.onHoldTickets);
      renderOverdueCount(ticketsObj.overdueTickets);
      renderCount('closed_count', ticketsObj.closedTickets);
      renderAverageTime(response.firstResponseTime, response.responseTime, response.resolutionTime);
      renderHappinessRating(response.customerHappiness);
    };

    const renderTicketColor = function () {
      var list = ['cntActOpn', 'cntActClosed', 'cntActOnHld'];
      for (i = 0; i < list.length; i++) {
        var container = document.getElementById('cntActDot' + i).classList;
        container.remove('cntActGrey');
        container.add(list[i]);
        document.getElementById('cntActLabel' + i).classList.remove('cntActGrey');
      }
    };

    const renderAverageTime = function (firstRespTime, respTime, resolutionTime) {
      var firstRespObj = convertMilliToHrsMins(parseInt(firstRespTime));
      var respObj = convertMilliToHrsMins(parseInt(respTime));
      var resolutionObj = convertMilliToHrsMins(parseInt(resolutionTime));
      var firstRespTime = parseFloat(firstRespObj.hours + '.' + firstRespObj.minutes);
      var respTime = parseFloat(respObj.hours + '.' + respObj.minutes);
      var resolutionTime = parseFloat(resolutionObj.hours + '.' + resolutionObj.minutes);
      var averageList = [];

      var maxHours = Math.max(firstRespTime, respTime, resolutionTime),
        maxRange = getMaxRange(maxHours);

      averageList.push((firstRespTime * 100) / maxRange);
      averageList.push((respTime * 100) / maxRange);
      averageList.push((resolutionTime * 100) / maxRange);
      renderAverageProgress(
        ['firstResProgress', 'respProgress', 'resolutionProgress'],
        averageList
      );
      renderAverage('firstRespTime', firstRespObj);
      renderAverage('respTime', respObj);
      renderAverage('resolutionTime', resolutionObj);
      document.getElementById('maxRange').innerText = maxRange;
    };
  });

  const renderAverageProgress = function (idList, averageList) {
    for (i = 0; i < idList.length; i++) {
      document.getElementById(idList[i]).style.width = `${averageList[i]}%`;
    }
  };

  const renderAverage = function (id, averageObj) {
    var hours = averageObj.hours,
      minutes = averageObj.minutes;
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    var content = hours + ':' + minutes + '<span class="cntActHrsTxt">hrs</span>';
    document.getElementById(id).innerHTML = content;
  };

  const renderHappinessRating = function (happinessObj) {
    let goodPercentage = 0,
      okPercentage = 0,
      badPercentage = 0;
    var goodCount = parseInt(happinessObj.goodCount) || 0;
    var okCount = parseInt(happinessObj.okCount) || 0;
    var badCount = parseInt(happinessObj.badCount) || 0;
    var totalCount = goodCount + okCount + badCount;
    if (totalCount) {
      goodPercentage = goodCount ? getPercentage(goodCount, totalCount) : 0;
      okPercentage = okCount ? getPercentage(okCount, totalCount) : 0;
      badPercentage = badCount ? 100 - (goodCount + okCount) : 0;
    }
    renderCount('totalHappiness', goodPercentage + '%');
    renderHappiness('goodPercent', goodPercentage);
    renderHappiness('okPercent', okPercentage);
    renderHappiness('badPercent', badPercentage);
  };

  const renderHappiness = function (id, percentage) {
    var content = percentage + '<span>%</span>';
    document.getElementById(id).innerHTML = content;
  };

  const renderCount = function (id, count) {
    var container = document.getElementById(id);
    var count = getFormattedNumber(count);
    container.innerText = getTwoDigitsValue(count);
    container.setAttribute('title', count);
  };

  const renderOverdueCount = function (count) {
    var container = document.getElementById('overdue_count');
    container.innerText = '(' + getFormattedNumber(count) + ' Overdue)';
  };

  const getFormattedNumber = function (number) {
    var numStr = number.toString();
    var splitNumStr = numStr.split('');
    if (number > 999 && number < 9999) {
      return splitNumStr[0] + 'k+';
    } else if (number > 9999) {
      return splitNumStr[0] + splitNumStr[1] + 'k+';
    } else {
      return number;
    }
  };
};

const getPercentage = (count, total) => {
  return Math.round((count / total) * 100);
};
