var stream = require('stream');
var util = require('util');
var Transform = require('stream').Transform;

var moment = require('moment');
var common = require('fin-common');
var parameterHelper = common.util.parameterHelper;

function FilterStream(options) {
    options = options || {};

    this._latestDate = null;
    this._mandantId = parameterHelper.isSet(options.mandantId);
    this._persistence = parameterHelper.isSet(options.persistence);

    Transform.call(this, {objectMode: true});
}

util.inherits(FilterStream, Transform);

FilterStream.prototype._initialize = function (callback) {
    var that = this;

    if (this._latestDate) {
        return callback(null, this._latestDate);
    }

    this._persistence.loadLatestPosition(this._mandantId, function(error, result) {
        if (error) return callback(error);

        if (!result) {
            that._latestDate = moment('1970-01-01');
        } else {
            that._latestDate = result.date();
        }

        callback(null, that._latestDate);
    });
};

FilterStream.prototype._transform = function (position, enc, callback) {
    var that = this;

    this._initialize(function (error, latestDate) {
        if (error) return that.emit('error', error);

        if (position.date().isAfter(latestDate)) {
            that.push(position);
        }

        callback();
    });
};

module.exports = FilterStream;