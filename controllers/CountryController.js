const models = require('../models');
const Country = models.Country;
const SubscriptionReport = models.SubscriptionReport;

module.exports = class CountryController {

    /****Get List Of Countries**************/
    async countryList(req, res) {
        return await Country.aggregate([{
            $group: {
                _id: {
                    "country_id": "$country_id",
                    "country_name": "$country_name"
                }
            },

        }])
            .then(result => res.status(200).send({ type: 'success', message: "List of country get successfully.", data: result }))
            .catch(error => res.status(200).send({ type: 'error', message: error.message }));
    }

    /****Get List Of State Based On Country Id **************/
    async stateList(req, res) {
        if (req.query.country_id === undefined || req.query.country_id === '') {
            return res.status(200).send({ type: 'error', message: 'Country Id field is required.' })
        }
        return await Country.aggregate([
            { $match: { country_id: Number(req.query.country_id) } },
            {
                $group: {
                    _id: {
                        "state_id": "$state_id",
                        "state_name": "$state_name",
                    }
                }
            }

        ])
            .then(result => res.status(200).send({ type: 'success', message: "List of state get successfully.", data: result }))
            .catch(error => res.status(200).send({ type: 'error', message: error.message }));
    }

    /****Get List Of Countries**************/
    async cityList(req, res) {
        if (req.query.state_id === undefined || req.query.state_id === '') {
            return res.status(200).send({ type: 'error', message: 'Country Id field is required.' })
        }
        return await Country.aggregate([
            { $match: { state_id: Number(req.query.state_id) } },
            {
                $group: {
                    _id: {
                        "id": "$id",
                        "name": "$name",
                    }
                }
            }

        ])
            .then(result => res.status(200).send({ type: 'success', message: "List of city get successfully.", data: result }))
            .catch(error => res.status(200).send({ type: 'error', message: error.message }));
    }
}