const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  console.log(req.body)
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};


exports.getAllSauce = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

// Envoie de like et dislike (POST)
exports.likesDislikes = (req, res, next) => {
  // likes = 1 (likes = +1)
  // chercher l'objet dans la base do donnée
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (!sauce.usersLiked.includes(req.body.userId) && req.body.like === 1) {
        // mise à jour sauce base de donnée
        Sauce.updateOne(
          { _id: req.params.id }, { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId } }
        )
          .then(() => res.status(201).json({ message: "Like ajouté!" }))
          .catch((error) => res.status(400).json({ error }));
      };
      // likes = 0 (likes neutre = 0)
      if (sauce.usersLiked.includes(req.body.userId) && req.body.like === 0) {
        // mise à jour sauce base de donnée
        Sauce.updateOne(
          { _id: req.params.id }, { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } }
        )
          .then(() => res.status(201).json({ message: "Like supprimé!" }))
          .catch((error) => res.status(400).json({ error }));
      };
      // likes = -1 (deslikes = +1)
      if (!sauce.usersDisliked.includes(req.body.userId) && req.body.like === -1) {
        // mise à jour sauce base de donnée
        Sauce.updateOne(
          { _id: req.params.id }, { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId } }
        )
          .then(() => res.status(201).json({ message: "Dislike ajouté!" }))
          .catch((error) => res.status(400).json({ error }));
      };
      // likes = 0 ( dislikes = 0)
      if (sauce.usersDisliked.includes(req.body.userId) && req.body.like === 0) {
        // mise à jour sauce base de donnée
        Sauce.updateOne(
          { _id: req.params.id }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId } }
        )
          .then(() => res.status(201).json({ message: "Dislike supprimé!" }))
          .catch((error) => res.status(400).json({ error }));
      };

    })
    .catch((error) => res.status(404).json({ error }));

};