import { E2EComponentFixture } from "e2e/e2e-component.fixture";

export class SidebarFixture extends E2EComponentFixture {

    async clickExitGame(){
        await this.page.locator('.quit-btn-small').click();
    }
    
    async clickSidebar(){
        await this.page.locator('.hamburger-btn').click();
    }
}