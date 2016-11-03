"use strict";
require('geckodriver')
const assert = require('assert')

var webdriver = require('selenium-webdriver'), By = webdriver.By
var browser = new webdriver.Builder().usingServer().withCapabilities({'browserName': 'firefox'}).build();

function deleteTrip() {
    browser.findElement(By.className('deleteTrip')).click().then(function (allDeleteButtons) {
        browser.findElement(By.className('yesDeleteTrip')).click().then(function () {
            browser.findElements(By.css('tr')).then(function (allTrs) {
                assert.equal(allTrs.length, 2)
                allTrs[1].findElements(By.css('td')).then(function (allTrTds) {
                    allTrTds.forEach(function (td, index) {
                        td.getText().then(function (tdText) {
                            if (index === 0) {
                                assert.equal(tdText, '28/02/2000')
                            }
                            else if (index === 1) {
                                assert.equal(tdText, 'my trip new copy')
                                console.log('delete trip OK!')
                                console.log('All tests passed!')
                            }
                        })
                    })
                })
            })
        })
    })
}

function copyTrip() {
    browser.findElement(By.className('copyTrip')).click().then(function () {
        browser.findElement(By.className('copyMessage')).then(function (copyMessageEl) {
            copyMessageEl.getText().then(function (copyMessageText) {
                assert.equal(copyMessageText, 'Copied trip is placed just underneath this one')
                browser.findElements(By.css('tr')).then(function (allTrs) {
                    assert.equal(allTrs.length, 3)
                    allTrs[2].findElements(By.css('td')).then(function (allTrTds) {
                        allTrTds.forEach(function (td, index) {
                            td.getText().then(function (tdText) {
                                if (index === 0) {
                                    assert.equal(tdText, '28/02/2000')
                                }
                                else if (index === 1) {
                                    assert.equal(tdText, 'my trip new')
                                }
                                else if (index === allTrTds.length - 1) {
                                    browser.findElements(By.className('editTrip')).then(function (allEditButtons) {
                                        assert.equal(allEditButtons.length, 2)
                                        allEditButtons[1].click().then(function () {
                                            browser.sleep(1000).then(function () {
                                                browser.findElement(By.className('createName')).then(function (nameInput) {
                                                    nameInput.sendKeys(' copy').then(function () {
                                                        browser.findElement(By.className('saveTrip')).click().then(function () {
                                                            browser.sleep(1000).then(function () {
                                                                browser.findElements(By.css('tr')).then(function (allTrs) {
                                                                    assert.equal(allTrs.length, 3)
                                                                    allTrs[2].findElements(By.css('td')).then(function (allTrTds) {
                                                                        allTrTds.forEach(function (td, index) {
                                                                            td.getText().then(function (tdText) {
                                                                                if (index === 0) {
                                                                                    assert.equal(tdText, '28/02/2000')
                                                                                }
                                                                                else if (index === 1) {
                                                                                    assert.equal(tdText, 'my trip new copy')
                                                                                }
                                                                                else if (index === allTrTds.length - 1) {
                                                                                    console.log('copy trip OK!')
                                                                                    deleteTrip()
                                                                                }
                                                                            })
                                                                        })
                                                                    })
                                                                })
                                                            })
                                                        })
                                                    })
                                                })
                                            })
                                        })
                                    })
                                }
                            })
                        })
                    })
                })
            })
        })
    })
}

function editTrip() {
    browser.findElement(By.className('editTrip')).click().then(function () {
        browser.sleep(1000).then(function () {
            browser.findElement(By.className('createName')).then(function (nameInput) {
                nameInput.sendKeys(' new').then(function () {
                    browser.findElement(By.id('mapid')).click().then(function () {
                        browser.findElement(By.className('glyphicon-trash')).click().then(function () {
                            browser.findElement(By.id('mapid')).click().then(function () {
                                browser.findElement(By.className('landmarkBtn')).click().then(function () {
                                    browser.findElement(By.className('saveTrip')).click().then(function () {
                                        browser.sleep(1000).then(function () {
                                            browser.findElements(By.css('td')).then(function (allTds) {
                                                allTds.forEach(function (td, index) {
                                                    td.getText().then(function (tdText) {
                                                        if (index === 0) {
                                                            assert.equal(tdText, '28/02/2000')
                                                        }
                                                        else if (index === 1) {
                                                            assert.equal(tdText, 'my trip new')
                                                        }
                                                        if (index === allTds.length - 1) {
                                                            console.log('edit trip OK!')
                                                            copyTrip()
                                                        }
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })
}

function createNewTrip() {
    browser.sleep(3000).then(function () {
        browser.findElement(By.id('newTripBtn')).click().then(function () {
            browser.sleep(1000).then(function () {
                browser.findElement(By.className('createName')).then(function (nameInput) {
                    nameInput.sendKeys('my trip').then(function () {
                        browser.findElement(By.className('createDate')).then(function (dateInput) {
                            dateInput.sendKeys('2000-02-28').then(function () {
                                browser.findElement(By.id('mapid')).click().then(function () {
                                    browser.findElement(By.className('glyphicon-trash')).click().then(function () {
                                        browser.findElement(By.id('mapid')).click().then(function () {
                                            browser.findElement(By.className('landmarkBtn')).click().then(function () {
                                                browser.findElement(By.className('glyphicon-trash')).click().then(function () {
                                                    browser.findElement(By.className('saveTrip')).click().then(function () {
                                                        browser.sleep(1000).then(function () {
                                                            browser.findElements(By.css('td')).then(function (allTds) {
                                                                allTds.forEach(function (td, index) {
                                                                    td.getText().then(function (tdText) {
                                                                        if (index === 0) {
                                                                            assert.equal(tdText, '28/02/2000')
                                                                        }
                                                                        else if (index === 1) {
                                                                            assert.equal(tdText, 'my trip')
                                                                        }
                                                                        if (index === allTds.length - 1) {
                                                                            console.log('create trip OK!')
                                                                            editTrip()
                                                                        }
                                                                    })
                                                                })
                                                            })
                                                        })
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })
}

browser.get('http://localhost:3000')
createNewTrip()


