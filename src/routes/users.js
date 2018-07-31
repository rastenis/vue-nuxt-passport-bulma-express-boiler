const { Router } = require("express");

const router = Router();

// Mock Users
const users = [
  {
    name: "Alexandre"
  },
  {
    name: "Pooya"
  },
  {
    name: "Sébastien"
  }
];

/* GET users listing. */
router.get("/users", function handleUserFetch(req, res) {
  // if (typeof req.user === 'undefined') {
  //   return res.status(403).json({ success: false, message: 'Auth needed.' });
  // }
  res.json(users);
  return;
});

/* GET user by ID. */
router.get("/users/:id", function handleSingleUserFetch(req, res) {
  if (typeof req.user === "undefined") {
    return res.status(403).json({ success: false, message: "Auth needed." });
  }

  const id = parseInt(req.params.id);
  if (id >= 0 && id < users.length) {
    res.json(users[id]);
  } else {
    res.sendStatus(404);
  }
});

router.get("/test", function test(req, res) {
  req.flash("info", "message");
  res.redirect("/");
});

module.exports = router;
