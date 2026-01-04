import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Movie } from '../movies/model/Movie.model';
import { User } from '../user/model/User.model';
import { LoginUser } from '../user/model/LoginUser.model';
import { NewUser } from '../user/model/NewUser.model';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private apiUrl = 'http://localhost:8090/api/v1.0/moviebooking';

    constructor(private http: HttpClient) { }

    userLogin(user: LoginUser): Observable<String> {
        return this.http.post<String>(this.apiUrl + '/login', user, {responseType: 'text' as 'json'});
    }
    userForgot(userID: string): Observable<LoginUser> {
        return this.http.get<LoginUser>(this.apiUrl + '/' + userID + "/forgot");
    }
    userForgotCheck(userID: string, password: string): Observable<User> {
        return this.http.post<User>(this.apiUrl + '/' + userID + "/forgot", { token: 'sample', password : password});
    }

    userRegister(user: NewUser): Observable<User> {
    return this.http.post<User>(this.apiUrl + '/register', user);
    }
}