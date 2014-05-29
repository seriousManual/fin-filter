var expect = require('chai').expect;
var moment = require('moment');

var Position = require('fin-common').Models.Position;
var Filter = require('../lib/Filter');

var createPosition = function(date) {
    return new Position({
        id: 'fooId',
        mandant_id: 'fooMandant',
        purpose: 'fooPurpose',
        classification: 'fooClassi',
        partner: 'fooPartner',
        partnerAccountNumber: 'fooPartnerAcountNr',
        partnerBank: 'fooBank',
        amount: 1,
        date: date
    });
};

var createPersistenceMock = function(error, result) {
    return {
        log: [],
        loadLatestPosition: function(mandantId, callback) {
            this.log.push(mandantId);

            process.nextTick(function() {
                callback(error || null, result || null);
            });
        }
    };
};

describe('filter', function() {
    it('should', function(done) {
        var log = [];
        var persistence = createPersistenceMock(null, createPosition('2014-01-02'));

        var f = new Filter({
            mandantId: 1,
            persistence: persistence
        });

        f.write(createPosition('2014-01-01'));
        f.write(createPosition('2014-01-02'));
        f.write(createPosition('2014-01-03'));
        f.write(createPosition('2014-01-04'));
        f.end();

        f.on('data', function(data) {
            log.push(data.date().format('YYYY-MM-DD'));
        });

        f.on('end', function() {
            expect(log).to.deep.equal([
                '2014-01-03', '2014-01-04'
            ]);

            expect(persistence.log).to.deep.equal([1]);

            done();
        });
    })
});