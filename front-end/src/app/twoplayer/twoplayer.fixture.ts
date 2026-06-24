import { E2EComponentFixture } from "e2e/e2e-component.fixture";

export class TwoPlayerFixture extends E2EComponentFixture {

    async clickRecetteExistante(){
        await this.page.getByText(/Je souhaite choisir une recette existante/i).click();
    }
    
}