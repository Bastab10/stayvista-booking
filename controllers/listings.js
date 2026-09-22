const Listing =require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index =async (req, res) => {
    const { search } = req.query;
    let allListings;
    
    console.log('Search query received:', JSON.stringify(search));
    console.log('Full query object:', JSON.stringify(req.query));
    
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      console.log('Using search regex:', searchRegex);
      
      allListings = await Listing.find({
        location: { $regex: searchRegex }
      }).sort({ createdAt: -1 });
      
      console.log(`Found ${allListings.length} listings for search "${search}"`);
      
      if (allListings.length === 0) {
        console.log('Trying fallback strategies...');
        
        const words = search.trim().split(/\s+/);
        for (const word of words) {
          const partialResults = await Listing.find({
            location: { $regex: word, $options: 'i' }
          }).sort({ createdAt: -1 });
          
          if (partialResults.length > 0) {
            allListings = partialResults;
            console.log(`Partial match with "${word}" found: ${partialResults.length}`);
            break;
          }
        }
        
        if (allListings.length === 0) {
          allListings = await Listing.find({
            location: { $regex: search.replace(/\s+/g, '.*'), $options: 'i' }
          }).sort({ createdAt: -1 });
          console.log(`Contains match found: ${allListings.length}`);
        }
      }
    } else {
      allListings = await Listing.find({}).sort({ createdAt: -1 });
    }
    
    res.render("listings/index.ejs", { allListings, search: search || '' });
  };

  module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
  };

  module.exports.showListing = async (req, res) => {
      let { id } = req.params;
      const listing = await Listing.findById(id)
      .populate({
        path:"reviews",
        populate:{
          path:"author",
        }, 
      })
       .populate("owner");
      if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
      }
      console.log(listing);
      res.render("listings/show.ejs", { 
        listing, 
        mapToken: process.env.MAP_TOKEN 
      });
    };


    module.exports.createListing = async (req, res, next) => {

      let response = await geocodingClient
      .forwardGeocode({
       query:req.body.listing.location,
       limit: 1,
      })
    .send()

      let url = req.file.path;
      let filename = req.file.filename;

        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = {url , filename};

        newListing.geometry = response.body.features[0].geometry;

        let saveListing = await newListing.save();
        console.log(saveListing);
        req.flash("success", "New listing created!");
        res.redirect("/listings");
      };

      module.exports.editListing = async (req, res) => {
          let { id } = req.params;
          const listing = await Listing.findById(id);
          if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings");
          }
          res.render("listings/edit.ejs", { listing });
        };

    module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
if(typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url,filename};
    await listing.save();
}
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  };
  module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
  };
