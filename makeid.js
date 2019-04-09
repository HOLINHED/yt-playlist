function create(size) {

   let id = "";
   
   for (let i = 0; i < size; i++) {

      if (Math.random() < 0.5) {

         const mod = Math.random() < 0.5 ? 65 : 97;

         const letter = Math.floor(Math.random() * 26);

         id += String.fromCharCode(letter + mod);

      } else {
         id += Math.floor(Math.random() * 9);
      }
   }

   return id;
}

module.exports = create;