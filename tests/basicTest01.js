import http from "k6/http";
import {check, fail} from "k6";
import {Trend} from "k6/metrics";

const trend_1 = new Trend('trend_for_method1');
const trend_2 = new Trend('trend_for_method2');
const trend_3 = new Trend('trend_for_method3');
const trend_4 = new Trend('trend_for_method4');

export const options = {
    scenarios: {
        sc_1:{
            executor: 'shared-iterations',
            vus: 5,
            iterations: 10,
            maxDuration: '1m',
            exec: 'testMethod1'
        },
        sc_2:{
            executor: 'per-vu-iterations',
            vus: 10,
            iterations: 20,
            maxDuration: '1m',
            exec: 'testMethod2'
        },
        sc_3:{
            executor: 'constant-vus',
            vus: 2,
            duration: '5s',
            exec: 'testMethod3'
        },
        sc_4:{
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '5s', target: 10 },
                { duration: '20s', target: 10 },
                { duration: '5s', target: 0 }
            ],
            gracefulRampdown: '0s',
            exec: 'testMethod1'
        }
    },
    discardResponseBodies: true,
    thresholds: {
                trend_for_method1: ['p(95)<30'],
                trend_for_method2: ['p(95)<20'],
                trend_for_method3: ['p(95)<20'],
                trend_for_method4: ['p(95)<40']
    }

}

export function testMethod1(){
    http.get('https://reqres.in/api/users?page=2')
}

export function testMethod2(){
    const url = 'https://reqres.in/api/users';
    const reqBody = JSON.stringify({
        "name": "sreetest",
        "job" : "qa"
    })
    const params= {
        headers : {'Content-Type': 'application/json'}
    }
    const response= http.post(url, reqBody, params);
    checkStatusCode(response)

}

export function testMethod3(){

    const url = 'https://reqres.in/api/users';
    const reqBody = JSON.stringify({
        "name": "sreetest",
        "job" : "qa-change"
    })
    const params= {
        headers : {'Content-Type': 'application/json'}
    }
    const response= http.put(url, reqBody, params);
    checkStatusCode(response)
    
}

function checkStatusCode(response){
    if(!(check(response, {'response status code check': res => res.status < 400}))){
            fail('api call ${response.url} failed with response ${response.body}')
         }
}