import { Component } from '@angular/core';
import axios from 'axios';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'searchmovie';

  searchQuery!: string;
  movies: any[] = [];
  selectedFilter!: string ;
  isDropdownOpen = false;

  languageValues: any = {};
  regionValues: any = {};
  releaseType: any = {};
  category: any = {};

  currentPage: number = 1;
  totalPages: number = 0;

  ngOnInit() {
    this.searchMovies();
  }

  searchMovies() {
    const apiKey = '08687b8d6f2e8c8cb41a4d6adf8ba026';
    let url = `https://api.themoviedb.org/3/${this.searchQuery ? 'search' : 'discover'}/movie?api_key=${apiKey}&query=${this.searchQuery}&page=${this.currentPage}`
    const languageFilters = Object.keys(this.languageValues).filter(key => this.languageValues[key]);
    const regionFilters = Object.keys(this.regionValues).filter(key => this.regionValues[key]);
    const releaseTypeFilter = Object.keys(this.releaseType).filter(key => this.releaseType[key]);
    const categoryFilter = Object.keys(this.category).filter(key => this.category[key]);
    const currentDate = new Date();

    // If search query is provided, add the appropriate parameter based on the input
    url += this.searchQuery
      ? parseInt(this.searchQuery) ? `${url}&year=${this.searchQuery}` : url
      : ``;

    //Language filter
    url += languageFilters.length > 0 ? `&${languageFilters.map(filter => `with_original_language=${filter}`).join('&')}` : '';

    //Region filter
    url += regionFilters.length > 0 ? `&${regionFilters.map(filter => `region=${filter}`).join('&')}` : '';

    //Releasetype filter
    url += releaseTypeFilter.length > 0 ? `&with_release_type=${releaseTypeFilter.join(',')}` : '';

    //Category filter
    url += categoryFilter.length > 0 ? `&with_genres=${categoryFilter.join(',')}` : '';

    // Add recent movies filter
    if (this.selectedFilter === 'recent') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      url += `&primary_release_date.gte=${oneMonthAgo.toISOString().slice(0, 10)}&primary_release_date.lte=${currentDate.toISOString().slice(0, 10)}`;
    }
    // Add top movies filter
    else if (this.selectedFilter === 'top') {
      url += '&sort_by=popularity.desc';
    }
    // Add trending today filter
    else if (this.selectedFilter === 'today') {
      const currentDate = new Date().toISOString().slice(0, 10);
      url += `&primary_release_date.gte=${currentDate}&primary_release_date.lte=${currentDate}`;
    }
    // Add trending this week filter 
    else if (this.selectedFilter === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      url += `&primary_release_date.gte=${oneWeekAgo.toISOString().slice(0, 10)}&primary_release_date.lte=${currentDate.toISOString().slice(0, 10)}`;
    }

    axios.get(url)
      .then(response => {
        this.movies = response.data.results;
        this.totalPages = response.data.total_pages;
      })
      .catch(error => {
        console.error(error);
      });
  }

  loadPage(page: number) {
    this.currentPage = page;
    this.searchMovies();
  }

  //To store image url
  getImageUrl(posterPath: string): string {
    return `https://image.tmdb.org/t/p/w500/${posterPath}`;
  }

  //Store the filter data
  selectFilter(filter: string) {
    this.selectedFilter = filter;
    this.searchMovies();
  }

  //Rating calculator
  getStars(rating: number): number[] {
    const roundedRating = Math.round(rating / 2);
    return Array(roundedRating).fill(0);
  }
}
