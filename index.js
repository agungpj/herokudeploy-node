const express = require("express");
const db = require("./connect/db");
const bcrypt = require("bcrypt");
const flash = require("express-flash");
const session = require("express-session");
const app = express();
const upload = require("./middlewares/fileUpload");
const PORT = 3000;

app.set("view engine", "hbs"); // set hbs

app.use("/public", express.static(__dirname + "/public"));
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use(flash());
app.use(
  session({
    cookie: {
      maxAge: 2 * 60 * 60 * 1000,
      secure: false,
      httpOnly: true,
    },
    store: new session.MemoryStore(),
    saveUninitialized: true,
    resave: false,
    secret: "secret",
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

function getFullTime(time) {
  let date = time.getDate();
  let monthIndex = time.getMonth();

  let year = time.getFullYear();

  function getFullHours() {
    let hours = time.getHours();
    if (hours < 10) {
      return `0${hours}`;
    } else {
      return `${hours}`;
    }
  }

  function getFullMinutes() {
    let minutes = time.getMinutes();
    if (minutes < 10) {
      return `0${minutes}`;
    } else {
      return `${minutes}`;
    }
  }

  let fullHours = getFullHours();
  let fullMinutes = getFullMinutes();

  let fullTime = `${date} ${month[monthIndex]} ${year} ${fullHours}:${fullMinutes} WIB`;
  return fullTime;
}

function getFullTime(time) {
  let month = [
    "January",
    "Februari",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  let date = time.getDate(); // mendapatkan tanggal
  let monthIndex = time.getMonth(); // mendapatkan bulan
  let year = time.getFullYear(); // mendpatkan tahun

  let hours = time.getHours(); // mendapatkan jam
  let minutes = time.getMinutes(); // mendapatkan menit

  return `${date} ${month[monthIndex]} ${year} ${hours}:${minutes} WIB`;
}

function getDistanceTime(times) {
  let timePost = times;
  let timeNow = new Date();
  let distance = timeNow - timePost;

  let milisecond = 1000;
  let secondInHours = 3600;
  let hoursInDay = 23;
  let minutes = 60;
  let seconds = 60;

  let distanceDay = Math.floor(
    distance / (milisecond * secondInHours * hoursInDay)
  );
  let distanceHours = Math.floor(distance / (milisecond * seconds * minutes));
  let distanceMinutes = Math.floor(distance / (milisecond * seconds));
  let dinstanceSeconds = Math.floor(distance / milisecond);

  if (distanceDay >= 1) {
    return `${distanceDay} day ago`;
  } else if (distanceHours >= 1) {
    return `${distanceHours} hours ago`;
  } else if (distanceMinutes >= 1) {
    return `${distanceMinutes} minutes ago`;
  } else {
    return `${dinstanceSeconds} seconds ago`;
  }
}

app.get("/", (request, response) => {
  response.render("index", {
    isLogin: request.session.isLogin,
    user: request.session.user,
  });
});

app.get("/blog", (req, res) => {
  db.connect((err, client, done) => {
    if (err) throw err;

    const query = `SELECT tb_blog.id, tb_blog.title, tb_blog.content, tb_blog.post_at, tb_blog.image, tb_user.name AS author,
      tb_blog.author_id FROM tb_blog LEFT JOIN tb_user ON tb_blog.author_id = tb_user.id`;

    client.query(query, function (err, result) {
      if (err) throw err;

      let dbData = result.rows;
      let newData = dbData.map((dbData) => {
        return {
          ...dbData,
          isLogin: req.session.isLogin,
          getFullTime: getFullTime(dbData.post_at),
          distanceTime: getDistanceTime(dbData.post_at),
        };
      });

      res.render("blog", {
        isLogin: req.session.isLogin,
        user: req.session.user,
        blogs: newData,
      });
    });
  });
});

app.post("/blog", upload.single("inputImage"), function (request, response) {
  let data = request.body;

  const authorId = request.session.user.id;

  const image = request.file.filename;

  let query = `INSERT INTO tb_blog(title, content, image, author_id) 
      VALUES ('${data.inputTitle}', '${data.inputContent}', '${image}','${authorId}')`;

  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(query, function (err, result) {
      if (err) throw err;

      response.redirect("/blog");
    });
  });
});

// app.get("/blog-detail/:id", (request, response) => {
//   const { id } = request.params;

//   db.connect(function (err, client, done) {
//     if (err) throw err;

//     client.query(
//       "SELECT * FROM tb_blog WHERE id = $1",
//       [id],
//       function (err, result) {
//         if (err) throw err;
//         let data = result.rows[0];
//         console.log(data);
//         data = {
//           ...data,
//           isLogin: request.session.isLogin,
//           getFullTime: getFullTime(data.post_at),
//         };
//         response.render("blog-detail", {
//           isLogin: request.session.isLogin,
//           user: request.session.user,
//           blog: data,
//         });
//       }
//     );
//   });
// });

app.get("/blog-detail/:id", (req, res) => {
  let id = req.params.id;

  db.connect((err, client, done) => {
    if (err) throw err;

    const query = `SELECT tb_blog.id, tb_blog.title, tb_blog.content, tb_blog.post_at, tb_blog.image, tb_user.name AS author,
      tb_blog.author_id FROM tb_blog LEFT JOIN tb_user ON tb_blog.author_id = tb_user.id WHERE tb_blog.id = ${id}`;

    client.query(query, (err, result) => {
      if (err) throw err;

      let data = result.rows[0];
      data = {
        ...data,
        isLogin: req.session.isLogin,
        getFullTime: getFullTime(data.post_at),
      };

      res.render("blog-detail", {
        id,
        isLogin: req.session.isLogin,
        user: req.session.user,
        blog: data,
      });
    });
  });
});

app.get("/add-blog", function (request, response) {
  if (!request.session.isLogin) {
    request.flash("danger", "Please Login!!");
    response.redirect("/login");
  }

  response.render("add-blog", {
    isLogin: request.session.isLogin,
    user: request.session.user,
  });
});

app.get("/edit-blog/:id", function (request, response) {
  response.render("edit-blog");
});

app.post("/edit-blog/:id", function (request, response) {
  const { id } = request.params;
  const { title, content } = request.body;

  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(
      "UPDATE tb_blog SET title = $1, content = $2 WHERE id=$3",
      [title, content, id],
      function (err, result) {
        if (err) throw err;
        console.log("data has been updated!");
        response.redirect("/blog");
      }
    );
  });
});

app.get("/delete-blog/:id", function (request, response) {
  const { id } = request.params;

  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(
      "DELETE FROM tb_blog WHERE id = $1",
      [id],
      function (err, result) {
        if (err) throw err;

        console.log("data has been deleted!");
        response.redirect("/blog");
      }
    );
  });
});

app.get("/form", function (request, response) {
  response.render("form");
});
app.get("/register", function (request, response) {
  response.render("register");
});

app.post("/register", (request, response) => {
  const { name, email, password } = request.body;
  const encryptPassword = bcrypt.hashSync(password, 10);
  db.connect(function (err, client, done) {
    if (err) throw err;
    client.query(
      "INSERT INTO tb_user (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, encryptPassword],
      function (err, result) {
        if (err) throw err;
        response.redirect("/blog");
      }
    );
  });
});

app.post("/login", function (request, response) {
  const { inputEmail, inputPassword } = request.body;

  const query = `SELECT * FROM tb_user WHERE email = '${inputEmail}'`;

  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(query, function (err, result) {
      if (err) throw err;

      // console.log(result.rows.length);

      if (result.rows.length == 0) {
        request.flash("danger", "Email and password dont match!");

        return response.redirect("/login");
      }

      const isMatch = bcrypt.compareSync(
        inputPassword,
        result.rows[0].password
      );
      // console.log(isMatch);

      if (isMatch) {
        request.session.isLogin = true;
        request.session.user = {
          id: result.rows[0].id,
          name: result.rows[0].name,
          email: result.rows[0].email,
        };

        request.flash("success", "Login success");
        response.redirect("/blog");
      } else {
        request.flash("danger", "Email and password dont match!");
        response.redirect("/login");
      }
    });
  });
});

app.get("/login", function (request, response) {
  response.render("login");
});

app.get("/logout", function (request, response) {
  request.session.destroy();

  response.redirect("/blog");
});

app.listen(PORT, function () {
  console.log(`Server starting on PORT ${PORT}`);
});
