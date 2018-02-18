'use strict';

import chai from 'chai';
import chaiFetchMock from 'chai-fetch-mock';
import fetchMock from 'fetch-mock';
import * as cealloga from './index';

class Headers {}

const client = cealloga.api({host:'', Headers: Headers});
const expect = chai.expect;
const fs = require('fs');

// Resources
const execReqBody = fs.readFileSync('./fixtures/colours.json');
const execResBody = fs.readFileSync('./fixtures/exec-barchart-200.json');
const publishResBody = fs.readFileSync('./fixtures/publish-barchart-200.json');
const validateReqBody = fs.readFileSync('./fixtures/barchart.json');
const validateResBody = fs.readFileSync('./fixtures/validate-barchart-200.json');

chai.use(chaiFetchMock);

describe('Barchart tests', () => {
    let id = '5a610660158ffae3135b7c7e';
    let name = 'barchart';
    
    before(() => {
        fetchMock.post('/code/validate', validateResBody);
        fetchMock.post('/cealloga/_test/5a610660158ffae3135b7c7e', execResBody);
        fetchMock.get('/code/publish/5a610660158ffae3135b7c7e', publishResBody);
        fetchMock.post('/cealloga/barchart', execResBody);
        
        // TODO: Add real fixtures for the rest
        fetchMock.get('/code/unpublish/barchart', {});
        fetchMock.get('/code/5a610660158ffae3135b7c7e', {});
        fetchMock.get('/code?', []);
        fetchMock.get('/code?name=barchart&published=0&', []);
    });
        
    it('validates barchart', () => {
        return client.code.validate(validateReqBody, (err, result, response) => {
            expect(fetchMock).route('/code/validate').to.have.been.called;
            expect(err).to.equal(null);
            expect(result.id).to.equal(id);
        });
    });
    
    it('executes barchart as test', () => {
        return client.cealloga._test(id, execReqBody, (err, result, response) => {
            expect(fetchMock).route(`/cealloga/_test/${id}`).to.have.been.called;
            expect(err).to.equal(null);
            expect(result.labels[0]).to.equal('blue');
            expect(result.series[0]).to.equal(1);
            expect(response.status).to.equal(200);
        });
    });
    
    it('publishes barchart', () => {
        return client.code.publish(id, (err, result, response) => {
            expect(fetchMock).route(`/code/publish/${id}`).to.have.been.called;
            expect(err).to.equal(null);
            expect(result.published).to.equal(true);
            expect(response.status).to.equal(200);
        });
    });
    
    it('executes barchart by published name', () => {
        return client.cealloga.exec(name, execReqBody, (err, result, response) => {
            expect(fetchMock).route(`/cealloga/${name}`).to.have.been.called;
            expect(err).to.equal(null);
            expect(result.labels[0]).to.equal('blue');
            expect(result.series[0]).to.equal(1);
            expect(response.status).to.equal(200);
        });
    });
    
    it('unpublishes barchart', () => {
        return client.code.unpublish(name, (err, result, response) => {
            expect(fetchMock).route(`/code/unpublish/${name}`).to.have.been.called;
            expect(err).to.equal(null);
            expect(typeof result).to.equal('object');
            expect(response.status).to.equal(200);
        });
    });
    
    it('gets a single record', () => {
        return client.code.record(id, (err, result, response) => {
            expect(fetchMock).route(`/code/${id}`).to.have.been.called;
            expect(err).to.equal(null);
            expect(typeof result).to.equal('object');
            expect(response.status).to.equal(200);
        });
    });
    
    it('gets a list of records', () => {
        return client.code.list({}, (err, result, response) => {
            expect(fetchMock).route('/code?').to.have.been.called;
            expect(err).to.equal(null);
            expect(result).to.be.an.instanceof(Array);
            expect(response.status).to.equal(200);
        });
    });
    
    it('gets an unpublished list of records', () => {
        return client.code.list({name:name,published:0}, (err, result, response) => {
            expect(fetchMock).route('/code?').to.have.been.called;
            expect(err).to.equal(null);
            expect(result).to.be.an.instanceof(Array);
            expect(response.status).to.equal(200);
        });
    });
    
    after(() => fetchMock.restore());
});
