const Airport = require('../../../models/airport')
const Nation = require('../../../models/nation')
const nations = require('./parseNationCode.json')

exports.nationList = (req, res) => {
    Nation.find({})
    .then( nations => {
        res.json({nations})
    })
    .catch(err => {
        res.send({error:err})
    })
}

exports.nationSearch = async (req, res) => {
    const keyword = req.params.keyword
    const nations = await Nation.find() 
                            .or([{nation_eng: { $regex: '.*' + keyword + '.*' }},
                                {nation_kor: { $regex: '.*' + keyword + '.*' }},
                                {code2: { $regex: '.*' + keyword + '.*' }},])
    const nation = await Nation.findOne()
                            .or([{nation_eng: keyword},
                                {nation_kor: keyword},
                                {code2: keyword},])
    res.json({'nation': nation, 'nations':nations})

}
exports.createNations = (req, res) => {
    Nation.create(nations)
    .catch( err=> {
        console.log(err)
    })


    res.json({'얍얍':'얍얍얍'})
}

exports.updateNations = (req, res) => {
    Nation.find({})
    .then( nations => {
        nations.map( nation => {
            const flagImgUrl = `https://www.countryflags.io/${nation.code2}/flat/64.png`
            Nation.updateOne({_id:nation._id}, {flagImgUrl:flagImgUrl})
            .catch(err => {
                console.log(err)
            })
        })
    })
    .then( () => {
        res.json({'얍얍':'얍얍얍'})
    })
    .catch( err=> {
        console.log(err)
    })


    
}