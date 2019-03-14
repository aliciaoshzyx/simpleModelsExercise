// pull in our models. This will automatically load the index.js from that folder
const models = require('../models');

// get the Cat model
const Cat = models.Cat.CatModel;
const Dog = models.Dog.DogModel;

// default fake data so that we have something to work with until we make a real Cat
const defaultData = {
  name: 'unknown',
  bedsOwned: 0,
};

const defaultDog = {
  name: 'unknown',
  breed: 'unknown',
  age: 0,
};

// track last one
let lastAdded = new Cat(defaultData);
let lastDog = new Dog(defaultDog);

const hostIndex = (req, res) => {
  res.render('index', {
    currentName: lastAdded.name,
    title: 'Home',
    pageName: 'Home Page',
  });
};

const readAllCats = (req, res, callback) => {
  Cat.find(callback);
};

const readAllDogs = (req, res, callback) => {
  Dog.find(callback);
};

const readCat = (req, res) => {
  const name1 = req.query.name;

  const callback = (err, doc) => {
    if (err) {
      return res.json({ err }); // if error, return it
    }

    // return success
    return res.json(doc);
  };

  Cat.findByName(name1, callback);
};

const readDog = (req, res) => {
  const name1 = req.query.name;

  const callback = (err, doc) => {
    if (err) {
      return res.json({ err });
    }
    return res.json(doc);
  };
  Dog.findByName(name1, callback);
};

const hostPage1 = (req, res) => {
  const callback = (err, docs) => {
    if (err) {
      return res.json({ err }); // if error, return it
    }

    // return success
    return res.render('page1', { cats: docs });
  };

  readAllCats(req, res, callback);
};

const hostPage2 = (req, res) => {
  res.render('page2');
};

const hostPage3 = (req, res) => {
  res.render('page3');
};

const hostPage4 = (req, res) => {
  const callback = (err, docs) => {
    if (err) {
      return res.json({ err });
    }

    return res.render('page4', { dogs: docs });
  };
  readAllDogs(req, res, callback);
};

const getName = (req, res) => {
  res.json({ name: lastAdded.name });
};

const getDogName = (req, res) => {
  res.render({ name: lastDog.name });
};

const setName = (req, res) => {
  if (!req.body.firstname || !req.body.lastname || !req.body.beds) {
    return res.status(400).json({ error: 'firstname,lastname and beds are all required' });
  }

  // if required fields are good, then set name
  const name = `${req.body.firstname} ${req.body.lastname}`;

  // dummy JSON to insert into database
  const catData = {
    name,
    bedsOwned: req.body.beds,
  };

  // create a new object of CatModel with the object to save
  const newCat = new Cat(catData);

  // create new save promise for the database
  const savePromise = newCat.save();

  savePromise.then(() => {
    // set the lastAdded cat to our newest cat object.
    // This way we can update it dynamically
    lastAdded = newCat;
    // return success
    res.render({ name: lastAdded.name, beds: lastAdded.bedsOwned });
  });

  // if error, return it
  savePromise.catch(err => res.render({ err }));

  return res;
};

const setDog = (req, res) => {
  if (!req.body.name || !req.body.breed || !req.body.age) {
    return res.status(400).render({ error: 'name, breed and beds are all required' });
  }

  const dogData = {
    name: req.body.name,
    breed: req.body.breed,
    age: req.body.age,
  };

  const newDog = new Dog(dogData);

  const savePromise = newDog.save();

  savePromise.then(() => {
    lastDog = newDog;
    res.render({ name: lastDog.name, breed: lastDog.breed, age: lastDog.age });
  });

  savePromise.catch(err => res.render({ err }));

  return res;
};
const updateLast = (req, res) => {
  lastAdded.bedsOwned++;

  const savePromise = lastAdded.save();

  // send back the name as a success for now
  savePromise.then(() => res.render({ name: lastAdded.name, beds: lastAdded.bedsOwned }));

  // if save error, just return an error for now
  savePromise.catch(err => res.render({ err }));
};

const updateLastDog = (req, res) => {
  lastDog.age++;

  const savePromise = lastDog.save();

  // send back the name as a success for now
  savePromise.then(() => res.render({ name: lastDog.name,
    breed: lastDog.breed,
    age: lastDog.age }));

  // if save error, just return an error for now
  savePromise.catch(err => res.render({ err }));
};

const searchName = (req, res) => {
  if (!req.query.name) {
    return res.json({ error: 'Name is required to perform a search' });
  }

  return Cat.findByName(req.query.name, (err, doc) => {
    // errs, handle them
    if (err) {
      return res.render({ err }); // if error, return it
    }

    // if no matches, let them know
    // (does not necessarily have to be an error since technically it worked correctly)
    if (!doc) {
      return res.render({ error: 'No cats found' });
    }

    // if a match, send the match back
    return res.render({ name: doc.name, beds: doc.bedsOwned });
  });
};

const searchDog = (req, res) => {
  if (!req.query.name) {
    return res.json({ error: 'A name is required to search' });
  }

  return Dog.findByName(req.query.name, (err, doc) => {
    if (err) {
      return res.render({ err }); // if error, return it
    }

    // if no matches, let them know
    // (does not necessarily have to be an error since technically it worked correctly)
    if (!doc) {
      return res.json({ error: 'No dogs found' });
    }
    const temp = doc;
    temp.age++;
    const savePromise = doc.save();

    savePromise.then(() => res.render('page3', { message: `${doc.name} is now ${doc.age} years old` }));

    return res.render('page3', { message: `${doc.name} is now ${doc.age} years old` });
  });
};


const notFound = (req, res) => {
  res.status(404).render('notFound', {
    page: req.url,
  });
};

// export the relevant public controller functions
module.exports = {
  index: hostIndex,
  page1: hostPage1,
  page2: hostPage2,
  page3: hostPage3,
  page4: hostPage4,
  readCat,
  readDog,
  getName,
  getDogName,
  setName,
  setDog,
  updateLast,
  updateLastDog,
  searchName,
  searchDog,
  notFound,
};
