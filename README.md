# Overview
This is a friendly fun project created after going through the pain of building custom things to calculate the leaderboard for the match predictions during the World Cup 2018, Euro Cup 2020, & World Cup 2022. 

This can be used as the dashboard for a fun social leaderboard between friends.

# Screenshot
![Leaderboard](https://user-images.githubusercontent.com/13219906/203118207-366788de-79fe-4526-a6cd-e26fe5404bea.png)

https://user-images.githubusercontent.com/13219906/203117361-3c3d61ad-739e-452e-aeaa-dae996f223bb.mp4

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode).

# Usage
Fork this project and peform the following steps to customize it for you and your friends:
1. To setup the boiler plate code using Svelte + Supabase, follow the documentation [Quickstart: Svelte](https://supabase.com/docs/guides/with-svelte)
2. `/data/*` has sample CSV files for prediction and results. Ensure that the uuid for participant and user_id are updated. In my case, I had predictions and results for World Cup 2018, Euro Cup 2020, & World Cup 2022. Remove those tournament entires which are not needed.
3. Create a database named `predicts` for storing the predictions participants will make. Use the CSV to import the data. Set the primary key, foriegn key relationship, default values etc.
4. Create a database name `results` for storing the match results. Follow the same as above.
5. Update `/src/config.js` to make changes to the stages and stage point.
6. Replace you tribe name from `Kotas` to something else starting from `index.html` & other `*.svelte`.

# To do
- Improve the documentation
- Add support multiple tribes or groups
- Add support for localization
- Add unit tests
- Improve the code modularity

# Screenshots
To be udpated

# Tech used
This uses Svelte, Supabase, Bootstrap, HTML, JS, CSS for a static single pages design best suited for all devices like mobile, desktop etc.

- [Svelte](https://svelte.dev/)
- [Supabase](https://supabase.com)
- Bootstrap template [New Age](https://github.com/BlackrockDigital/startbootstrap-new-age)
- [Typescript](https://www.typescriptlang.org/)
- [Vite](https://vitest.dev/)
- Avatars generated from [Getavataaars](https://getavataaars.com).

# Copyright and License
Code released under the [MIT](https://github.com/anoobbacker/betwc/blob/master/LICENSE) license.

## Available Scripts
In the project directory, you can run:

### `npm install`
To set up the packages.

### `npm run dev`
Runs the app in the development mode.\
Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`
Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`
Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!
