const GuideService = require('../../../models/guideservice')
const Tag = require('../../../models/tag')
const Review = require('../../../models/review')
const User = require('../../../models/user')
const Option = require('../../../models/option')

exports.findReview = (req, res) => {
  console.log('findReview');
    GuideService.findOne({ _id : req.params.id })
      .populate('reviews')
      .select('reviews')
      .then((result) => {
        res.json(result);
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
};

exports.findOption = (req, res) => {
  console.log('findOption');
    GuideService.findOne({ _id : req.params.id })
      .populate('options')
      .select('options')
      .then((result) => {
        res.json(result);
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
};

exports.deleteGuideService = (req,res) =>{
  console.log(req)
  const respond=()=>{
    res.json({
      message:"delete GuideService OK"
    })
  }

  const onError = (error) => {
      res.status(403).json({
          message: error.message
      })
  }
  GuideService.deleteByTitle(req.params,req.params.title)
  .then(respond)
  .then(onError)
}

exports.updateGuideService = (req, res) => {
    GuideService.findOne({user:req.params.user,title:req.params.title}, (err,guideservice) => {
        if (guideservice) {
              console.log(guideservice)
              let id=guideservice._id
              GuideService.update({ _id: id }, { $set: req.body }, function(err, output){
                  if(err) res.status(500).json({ error: 'database failure' });
                  console.log(output);
                  if(!output.n) return res.status(404).json({ error: 'guideservice not found' });
                  res.json( { message: 'guideservice updated' } );
              })
          if(err) res.status(500).json({err})
        }
        if(err) res.status(500).json({err})
      })
}

exports.findGSAll=(req,res)=>{
  GuideService.find()
  .populate({path:'tags',model:Tag})
  .populate({path:'reviews',model:Review})
  .populate({path:'user',model:User,select:'-password'})
  .then((result) => {
    res.json(result);
  })
  .catch((error) => {
    res.status(500).json({ error:error });
  });
}

exports.SearchGS=(req,res)=>{
  const keyword = req.params.keyword
  console.log(keyword);
  GuideService.find()
  .or([{city_eng: { $regex: '.*' + keyword + '.*' }},
      {city_kor: { $regex: '.*' + keyword + '.*' }},
      {nation_eng: { $regex: '.*' + keyword + '.*' }},
      {nation_kor: { $regex: '.*' + keyword + '.*' }}])
  .then(
      guideservices => {
          console.log(guideservices);
          res.json({guideservices})
      }
  )
  // res.json({message:'message'})
}

exports.findGSById=(req,res)=>{
  console.log(req.params);
  GuideService.findOne({_id:req.params.id})
  .then((result) => {
    res.json(result);
  })
  .catch((error) => {
    res.status(500).json({ error });
  });
}

exports.findGSByUserObIdTitle = (req,res)=>{
  const onError = (error) => {
      res.status(403).json({
          message: error.message
      })
  }
  console.log('findGSByUserObIdTitle');
  GuideService.findGSByUserObIdTitle(req.params.userObId,req.params.title)
  .then(
      guideservice => {
          res.json(guideservice)
      }
  )
  .catch(onError)
}


exports.createGuideService = (req,res) =>{
  console.log(req.body);
  tagsName=req.body.tags;
  req.body.tags=[];
  options=req.body.options;
  req.body.options=[];
  console.log(options);
  var GS=new GuideService(req.body);
  let guideserviceId=GS._id
  GS.save(err => {
    for (var i = 0; i < tagsName.length; i++) {
      const tag = new Tag({tag:tagsName[i]})
      tag.guideservice=GS._id
      tag.save()
        .then((result) => {
          GuideService.findOne({_id:guideserviceId}, (err, guideservice) => {
              if(err) res.status(500).json({err})
              if (guideservice) {
                  guideservice.tags.push(tag);
                  guideservice.save();
              }
          });
        })
    }
    for (var i = 0; i < options.length; i++) {
      const option = new Option(options[i])
      option.guideservice=GS._id
      option.save()
        .then((result) => {
          GuideService.findOne({_id:guideserviceId}, (err, guideservice) => {
              if(err) res.status(500).json({err})
              if (guideservice) {
                  guideservice.options.push(option);
                  guideservice.save();
              }
          });
        })
    }
    if (err) res.status(500).send(err);
    res.json(GS);
  })
}

exports.likeGuideService = (req, res) => {
  User.findById(req.params.userId)
  .then( user => {
    GuideService.findById(req.params.guideServiceId)
    .then( async (guideService) => {
      user.likeGuideServices.forEach(service => {
        console.log(service.toString())
      })
      if(user.likeGuideServices.filter( service => service.toString() === guideService._id.toString()).length !== 0) { // 좋아요 삭제
        user.likeGuideServices = await user.likeGuideServices.filter( likeService => {
          return likeService.toString() !== guideService._id.toString()
        })
        guideService.likeUsers = await guideService.likeUsers.filter( likeUser => {
          return likeUser.toString() !== user._id.toString()
        })
        user.save()
        guideService.save()
        res.json({message:"삭제 완료"})
      }
      else {
        await user.likeGuideServices.push(guideService)
        await guideService.likeUsers.push(user)
        user.save()
        guideService.save()
        res.json({message:"추가 완료"})
      }
    })
  })
  .catch( err => {
    res.json({error: err})
  })
}
