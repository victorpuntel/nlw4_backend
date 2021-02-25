import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { SurveyRepository } from '../repositories/SurveyRepository';
import { SurveyUserRepository } from '../repositories/SurveyUserRepository';
import { UserRepository } from '../repositories/UserRepository';
import sendMailService from '../services/sendMailService';
import { resolve } from 'path';

class SendMailController {
    async execute(request: Request, response: Response){
        const { email, survey_id } = request.body;

        const userRepository = getCustomRepository(UserRepository);
        const surveyRepository = getCustomRepository(SurveyRepository);
        const surveyUsersRepository = getCustomRepository(SurveyUserRepository);

        const userExists = await userRepository.findOne({ email });

        if(!userExists){
            return response.status(400).json({
                error: 'User does not exists'
            });
        }

        const surveyExists = await surveyRepository.findOne({ id: survey_id });

        if(!surveyExists){
            return response.status(400).json({
                error: 'Survey does not exists'
            });
        }

        const variables = {
            name: userExists.name,
            title: surveyExists.title,
            description: surveyExists.description,
            user_id: userExists.id,
            link: process.env.URL_MAIL
        }

        const npsPath = resolve(__dirname, '..', 'views', 'emails', 'npsMail.hbs');

        const surveyUserExists = await surveyUsersRepository.findOne({
            where: [{ user_id: userExists.id}, {value: null}]
        });

        if(surveyUserExists){
            await sendMailService.execute(email, surveyExists.title, variables, npsPath);
            return response.json(surveyUserExists);
        }

        const surveyUser = surveyUsersRepository.create({
            user_id: userExists.id,
            survey_id
        });

        await surveyUsersRepository.save(surveyUser);

        await sendMailService.execute(email, surveyExists.title, variables, npsPath);

        return response.json(surveyUser);

    }
}

export { SendMailController }