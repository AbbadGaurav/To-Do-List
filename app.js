//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _=require("lodash")
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB")
const itemSchema = {
  name: String
}
const Item = mongoose.model("Item", itemSchema)
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
const Item1 = new Item({
  name: "Welcome to your todo list !"
})
const Item2 = new Item({
  name: "hit + to add new item!"
})
const Item3 = new Item({
  name: "click the cj=heckbox to delete new item !"
})
const defaultItems = [Item1, Item2, Item3]

const listSchema = {
  name: String,
  items: [itemSchema]
}
const List = mongoose.model("List", listSchema)


app.get("/", function (req, res) {
  Item.find({}).then((foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems).then(() => {
        console.log("Success");
      }).catch((err) => {
        console.log(err);
      });
      res.redirect("/")
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  }).catch((err) => {
    console.log(err);
  });
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName=req.body.list
  const item = new Item({
    name: itemName
  })
  if(listName=== "Today"){

    item.save();
    res.redirect("/")
  }else{
    List.findOne({name:listName}).then((foundlist) => {
      foundlist.items.push(item)
      foundlist.save()
      res.redirect("/"+listName)
    }
    )
  }

});


app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox
  const listName=req.body.listName

  if(listName==="Today"){

    Item.findByIdAndDelete(checkedItemId).then(() => {
      console.log("Successfully deleted");
      res.redirect("/")
    }).catch((err) => {
      console.log(err);
    })
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{ _id:checkedItemId}}}).then((foundItems) => {
      res.redirect("/"+listName)
    }).catch((err) => {
      console.log(err);
      
    }
    )
  }

})


app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName)
  List.findOne({ name: customListName }).then((foundlist) => {
    if (!foundlist) {

      const list = new List({
        name: customListName,
        items: defaultItems
      })
      list.save()
      res.redirect("/" + customListName)
      console.log("Doesn't exist");
    } else {
      res.render("list", { listTitle: foundlist.name, newListItems: foundlist.items })
      console.log("Exist");

    }

  }).catch((err) => {
    console.log(err);

  })
  // console.log(req.params.customListName);
})





// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function (req, res) {
  res.render("about");
});




app.listen(3000, function () {
  console.log("Server started on port 3000");
});
